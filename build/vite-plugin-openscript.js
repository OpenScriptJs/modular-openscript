/**
 * Vite Plugin: OpenScript Component Name Preserver
 *
 * This plugin transforms OpenScript component files before bundling to add
 * explicit component names that survive minification.
 *
 * Problem: When Vite minifies code, class names change (e.g., TodoApp -> t),
 * breaking OpenScript's component registration which relies on constructor.name
 *
 * Solution: Parse component files and inject the component name explicitly
 * in the constructor, making it immune to minification.
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

export default function openScriptComponentPlugin() {
	return {
		name: "vite-plugin-openscript-components",

		// Only transform JS/TS files
		transform(code, id) {
			// Skip node_modules and non-component files
			if (id.includes("node_modules")) {
				return null;
			}

			// Only process files that likely contain components
			if (
				!code.includes("extends Component") &&
				!code.includes("extend Component") &&
				!code.includes("h.") &&
				!code.includes("h[")
			) {
				return null;
			}

			try {
				// Parse the code into an AST
				const ast = parse(code, {
					sourceType: "module",
					plugins: ["jsx", "typescript", "decorators-legacy"],
				});

				let modified = false;

				// Traverse the AST to find component classes
				traverse.default(ast, {
					ClassDeclaration(path) {
						const node = path.node;

						// Check if this class extends Component
						if (!node.superClass) return;

						const extendsComponent =
							node.superClass.name === "Component" ||
							node.superClass.property?.name === "Component";

						if (!extendsComponent) return;

						// Get the component name
						const componentName = node.id.name;

						// Check if constructor exists
						let hasConstructor = false;
						let constructorPath = null;

						for (const member of node.body.body) {
							if (
								member.type === "ClassMethod" &&
								member.kind === "constructor"
							) {
								hasConstructor = true;
								constructorPath = member;
								break;
							}
						}

						if (hasConstructor && constructorPath) {
							// Check if super() exists and add name assignment after it
							const body = constructorPath.body.body;
							let superIndex = -1;

							for (let i = 0; i < body.length; i++) {
								const stmt = body[i];
								if (
									stmt.type === "ExpressionStatement" &&
									stmt.expression.type === "CallExpression" &&
									stmt.expression.callee.type === "Super"
								) {
									superIndex = i;
									break;
								}
							}

							// Check if name is already set
							const hasNameAssignment = body.some(
								(stmt) =>
									stmt.type === "ExpressionStatement" &&
									stmt.expression.type ===
										"AssignmentExpression" &&
									stmt.expression.left.property?.name ===
										"name"
							);

							if (superIndex !== -1 && !hasNameAssignment) {
								// Insert `this.name = 'ComponentName';` after super()
								body.splice(superIndex + 1, 0, {
									type: "ExpressionStatement",
									expression: {
										type: "AssignmentExpression",
										operator: "=",
										left: {
											type: "MemberExpression",
											object: { type: "ThisExpression" },
											property: {
												type: "Identifier",
												name: "name",
											},
											computed: false,
										},
										right: {
											type: "StringLiteral",
											value: componentName,
										},
									},
								});
								modified = true;
							}
						} else {
							// No constructor exists, add one with super() and name assignment
							node.body.body.unshift({
								type: "ClassMethod",
								kind: "constructor",
								key: {
									type: "Identifier",
									name: "constructor",
								},
								params: [
									{
										type: "RestElement",
										argument: {
											type: "Identifier",
											name: "args",
										},
									},
								],
								body: {
									type: "BlockStatement",
									body: [
										{
											type: "ExpressionStatement",
											expression: {
												type: "CallExpression",
												callee: { type: "Super" },
												arguments: [
													{
														type: "SpreadElement",
														argument: {
															type: "Identifier",
															name: "args",
														},
													},
												],
											},
										},
										{
											type: "ExpressionStatement",
											expression: {
												type: "AssignmentExpression",
												operator: "=",
												left: {
													type: "MemberExpression",
													object: {
														type: "ThisExpression",
													},
													property: {
														type: "Identifier",
														name: "name",
													},
													computed: false,
												},
												right: {
													type: "StringLiteral",
													value: componentName,
												},
											},
										},
									],
								},
							});
							modified = true;
						}
					},

					// Transform h.div(...) to h['div'](...)
					// This prevents minification from mangling element/component names
					MemberExpression(path) {
						const node = path.node;

						// Only transform if:
						// 1. Object is identifier 'h'
						// 2. Property is accessed with dot notation (not already computed)
						// 3. Not already a computed member expression
						if (
							node.object.type === "Identifier" &&
							node.object.name === "h" &&
							!node.computed &&
							node.property.type === "Identifier"
						) {
							// Convert to computed member expression: h['propertyName']
							node.computed = true;
							node.property = {
								type: "StringLiteral",
								value: node.property.name,
							};
							modified = true;
						}
					},
				});

				// If we modified the AST, generate new code
				if (modified) {
					const output = generate.default(ast, {}, code);
					return {
						code: output.code,
						map: output.map,
					};
				}

				return null;
			} catch (error) {
				// If parsing fails, log and return original code
				console.warn(
					`Failed to parse ${id} for OpenScript component transformation:`,
					error.message
				);
				return null;
			}
		},
	};
}
