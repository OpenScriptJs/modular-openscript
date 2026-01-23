import fs from "fs";
import path from "path";
import { normalizePath } from "vite";
import MagicString from "magic-string";

/**
 * OpenScript Component Auto-Import Plugin
 * Automatically discovers components and provides IDE autocomplete + bundling
 */
export function openScriptComponentPlugin(options = {}) {
  const { componentsDir = "src/components", generateTypes = true } = options;

  let config;
  let components = [];

  return {
    name: "openscript-component-plugin",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    buildStart() {
      // Scan components directory
      const componentsPath = path.resolve(config.root, componentsDir);

      if (!fs.existsSync(componentsPath)) {
        console.warn(
          `[OpenScript] Components directory not found: ${componentsPath}`,
        );
        return;
      }

      // Find all component files
      components = scanComponents(componentsPath);

      console.log(
        `[OpenScript] Found ${components.length} components:`,
        components.map((c) => c.name).join(", "),
      );

      // Generate TypeScript definitions if enabled
      if (generateTypes) {
        generateTypeDefinitions(config.root, componentsDir, components);
      }
    },

    transform(code, id) {
      // Normalize path for Windows compatibility
      const normalizedId = normalizePath(id);

      // Only transform files in components directory
      if (
        !normalizedId.includes(componentsDir) ||
        !normalizedId.endsWith(".js")
      )
        return;

      const s = new MagicString(code);
      let hasChanged = false;

      // 1. Check for Functional Components: function MyComp(...) { ... }
      // Regex matches: 1=export_modifier, 2=Name, 3=Args
      const funcRegex =
        /(export\s+default\s+|export\s+)?function\s+([A-Z]\w*)\s*\(([^)]*)\)\s*\{/g;
      let match;

      // We need to handle multiple components in one file, though rare for default exports
      // But let's loop to be safe and use a while loop with exec
      while ((match = funcRegex.exec(code)) !== null) {
        const [fullMatch, exportModifier = "", name, args] = match;
        const start = match.index;
        const bodyStart = start + fullMatch.length - 1; // pointing to {

        // Find closing brace
        let braceCount = 1;
        let end = -1;
        let i = bodyStart + 1;

        while (i < code.length) {
          if (code[i] === "{") braceCount++;
          else if (code[i] === "}") braceCount--;

          if (braceCount === 0) {
            end = i;
            break;
          }
          i++;
        }

        if (end !== -1) {
          // Found the component body
          hasChanged = true;

          // Replace header
          // "export default function Name(args) {"
          // ->
          // "export default class Name extends Component { constructor() { super(); this.name = "Name"; } render(args) {"
          const replacement = `${exportModifier}class ${name} extends Component {
  constructor() {
    super();
    this.name = "${name}";
  }

  render(${args}) {`;

          s.overwrite(start, bodyStart + 1, replacement);

          // Append closing brace for the class
          s.appendRight(end + 1, "\n}");
        }
      }

      // 2. Existing logic: Class Component name injection
      // Only run this if we haven't just converted it (though regex below checks for class)
      // If we converted, we already injected the name.
      // But there might be other classes in the file.

      // Note: If we just converted, s.toString() inside loop?
      // MagicString handles edits on original string.
      // But our regex 'code.match' works on original code.
      // If we have mixed content, we should be careful.
      // The original logic scanned for "class ... extends Component".
      // Our new logic creates that string in output, but original code didn't have it.
      // So checks against 'code' for class will only find ORIGINAL classes.

      const classRegex = /class\s+(\w+)\s+extends\s+Component/g;
      while ((match = classRegex.exec(code)) !== null) {
        const className = match[1];

        // Check if this class already has name set in ORIGINAL code
        // (If we synthesized it, we don't need to do this, and regex won't find synthesized one)
        const classStart = match.index;
        // Simple check range for existing name assignment is hard with regex loop
        // But we can check globally if the code has it for this class
        if (code.includes(`this.name = "${className}"`)) continue;

        // Find constructor or inject it
        // We need to look inside the class body.
        // Find the opening brace for this class
        const openBraceIndex = code.indexOf("{", classStart);
        if (openBraceIndex === -1) continue;

        // Check if constructor exists within reasonable distance/scope?
        // This is tricky with simple string searching on the whole file.
        // But let's assume standard structure or rely on previous logic's robustness
        // The previous logic used 'if (code.includes("constructor"))' which is global!
        // That was capable of false positives if multiple classes existed or comments.
        // But let's stick to the previous logic style for consistency but apply it carefully.

        // Actually, since I'm rewriting the transform function, I can try to improve it slightly
        // or just keep it as is for existing classes.

        // Given constraints, I will preserve the logic's INTENT:
        // Ensure `this.name` is set.

        // For the *functional* transformation I just added, I *know* I added the constructor.
        // So I don't need to process those.
        // So I only process matches from `classRegex` on the `code` string.
        // Since `code` is original source, it won't include my functional-to-class transforms.
        // So I am only processing originally-written classes. Perfect.

        // Re-implementing existing logic for original classes:

        // Try to find constructor in the class body?
        // We'll search for `constructor` keyword after class def.
        const nextClassIndex = code.indexOf("class ", openBraceIndex);
        const searchEnd = nextClassIndex === -1 ? code.length : nextClassIndex;
        const constructorMatch = code
          .substring(openBraceIndex, searchEnd)
          .match(/constructor\s*\(/);

        if (constructorMatch) {
          // Constructor exists
          // Find super() call relative to class start
          const constructorAbsIndex = openBraceIndex + constructorMatch.index;
          // Search for super() after constructor
          const superMatch = code
            .substring(constructorAbsIndex, searchEnd)
            .match(/super\s*\([^)]*\)\s*;?/);
          if (superMatch) {
            const insertAt =
              constructorAbsIndex + superMatch.index + superMatch[0].length;
            s.appendRight(
              insertAt,
              `\n    if (!this.name) this.name = "${className}";`,
            );
            hasChanged = true;
          }
        } else {
          // No constructor, inject one at start of class
          s.appendRight(
            openBraceIndex + 1,
            `\n  constructor() { super(); this.name = "${className}"; }`,
          );
          hasChanged = true;
        }
      }

      // 3. Inject Component import if needed
      // If we did any transformation (functional or existing class), we might need Component.
      // Especially for functional -> class.
      if (hasChanged) {
        // Check if Component is imported
        // Matches: import { Component } ... or import ... Component ...
        // We use a regex that supports multi-line named imports by looking inside braces

        const hasNamedImport =
          /import\s*\{[^}]*?\bComponent\b[^}]*?\}\s*from/.test(code);
        const hasDefaultOrNamespaceImport =
          /import\s+(?:[\w*\s,]*\bComponent\b)/.test(code);

        // Simple check:
        if (!hasNamedImport && !hasDefaultOrNamespaceImport) {
          // Need to import Component.
          // Check if existing import from "modular-openscriptjs" exists
          if (code.includes("modular-openscriptjs")) {
            // Try to add to existing import? Hard with regex.
            // Easier to just add a new line.
            s.prepend(`import { Component } from "modular-openscriptjs";\n`);
          } else {
            s.prepend(`import { Component } from "modular-openscriptjs";\n`);
          }
        }
      }

      if (hasChanged) {
        return {
          code: s.toString(),
          map: s.generateMap({ source: id, includeContent: true }),
        };
      }
    },
  };
}

/**
 * Scan components directory recursively
 */
function scanComponents(dir, basePath = "") {
  const components = [];

  if (!fs.existsSync(dir)) return components;

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativePath = path.join(basePath, file.name);

    if (file.isDirectory()) {
      // Recursively scan subdirectories
      components.push(...scanComponents(fullPath, relativePath));
    } else if (file.name.endsWith(".js") && !file.name.endsWith(".test.js")) {
      // Extract component name from filename
      const name = path.basename(file.name, ".js");

      // Skip non-component files (lowercase, index, etc.)
      if (name[0] === name[0].toUpperCase() && name !== "index") {
        components.push({
          name,
          path: relativePath.replace(/\\/g, "/"),
        });
      }
    }
  }

  return components;
}

/**
 * Generate TypeScript definition file for IDE autocomplete
 */
function generateTypeDefinitions(root, componentsDir, components) {
  // Place d.ts in the parent directory of componentsDir
  const componentsAbsDir = path.resolve(root, componentsDir);
  const dtsDir = path.dirname(componentsAbsDir);
  const dtsPath = path.resolve(dtsDir, "openscript-components.d.ts");

  const imports = components
    .map((c) => {
      const componentAbsPath = path.resolve(componentsAbsDir, c.path);
      let relativePath = path.relative(dtsDir, componentAbsPath);

      // Normalize to forward slashes
      relativePath = normalizePath(relativePath);

      // Remove extension
      relativePath = relativePath.replace(/\.\w+$/, "");

      // Ensure it starts with ./ or ../
      if (!relativePath.startsWith(".") && !relativePath.startsWith("/")) {
        relativePath = "./" + relativePath;
      }

      return `import type ${c.name} from '${relativePath}';`;
    })
    .join("\n");

  const properties = components
    .map((c) => `    ${c.name}: typeof ${c.name};`)
    .join("\n");

  const content = `// Auto-generated by OpenScript - DO NOT EDIT
// This file provides IDE autocomplete for h.ComponentName

import type { MarkupEngine } from 'modular-openscriptjs';

${imports}

declare module 'modular-openscriptjs' {
  interface MarkupEngine {
${properties}
  }
}

export {};
`;

  fs.writeFileSync(dtsPath, content, "utf-8");
  console.log(`[OpenScript] Generated type definitions: ${dtsPath}`);
}
