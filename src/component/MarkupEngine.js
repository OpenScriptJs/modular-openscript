import DOMReconciler from "./DOMReconciler.js";
import Utils from "../utils/Utils.js";
import Component from "./Component.js";
import State from "../core/State.js";
import { container } from "../core/Container.js";

/**
 * Base Markup Engine Class
 */
export default class MarkupEngine {
	/**
	 * The IDs for components on the DOM awaiting
	 * rendering
	 */
	static ID = 0;

	constructor() {
		/**
		 * Keeps the components
		 * @type {Map<string,Component>}
		 */
		this.compMap = new Map();

		/**
		 * Keeps the components arguments
		 * @type {Map<string, Array<string|DocumentFragment|HTMLElement>}
		 */
		this.compArgs = new Map();

		/**
		 * Keeps a temporary component-events map
		 * @type {Map<string,Array<Function>>}
		 */
		this.eventsMap = new Map();

		this.reconciler = new DOMReconciler();

		/**
		 * References the DOM object
		 */
		this.dom = window.document;

		/**
		 *
		 * @param {string} name component name
		 * @param {Component} component OpenScript component for rendering.
		 *
		 *
		 * @return {HTMLElement|Array<HTMLElement|String>}
		 */
		this.component = (name, component) => {
			if (!(typeof name === "string")) {
				throw Error(
					`MarkupEngine.Exception: A Component's name must be a string: type '${typeof name}' given`
				);
			}

			if (!(component instanceof Component)) {
				throw new Error(
					`MarkupEngine.Exception: The component for ${name} must be an Component component. ${component.constructor.name} given`
				);
			}

			this.compMap.set(name, component);
		};

		/**
		 * Deletes the component from the Markup Engine Map.
		 * @emits unmount
		 * Removes an already registered company
		 * @param {string} name
		 * @param {boolean} withMarkup remove the markup of this component
		 * as well.
		 * @returns {boolean}
		 */
		this.deleteComponent = (name, withMarkup = true) => {
			if (!this.has(name)) {
				return false;
			}

			if (withMarkup) this.getComponent(name).unmount();

			this.getComponent(name).emit("unmount");

			return this.compMap.delete(name);
		};

		/**
		 * Checks if a component is registered with the
		 * markup engine.
		 * @param {string} name
		 * @returns
		 */
		this.has = (name) => {
			return this.compMap.has(name);
		};

		/**
		 * Checks if a component is registered
		 * @param {string} name
		 * @param {string} method method name
		 * @returns
		 */
		this.isRegistered = (name, method = "access") => {
			if (this.has(name)) return true;

			console.warn(
				`MarkupEngine.Warn: Trying to ${method} an unregistered component {${name}}. Please ensure that the component is registered by using h.has(componentName)`
			);

			return false;
		};

		this.reconcile = (domNode, newNode) => {
			this.reconciler.reconcile(newNode, domNode);
		};

		/**
		 * Removes all a component's markup
		 * from the DOM
		 * @param {string} name
		 */
		this.hide = (name) => {
			if (!this.isRegistered(name, "hide")) return false;

			const c = this.getComponent(name);
			c.hide();

			return true;
		};

		/**
		 * make all the component visible
		 * @param {string} name component name
		 * @returns
		 */
		this.show = (name) => {
			if (!this.isRegistered(name, "show")) return false;

			const c = this.getComponent(name);
			c.show();

			return true;
		};

		this.modify = (element) => {
			element.__eventListeners = element.__eventListeners ?? {};

			element.addListener = function (event, listener) {
				this.__eventListeners[event] =
					this.__eventListeners[event] ?? [];
				this.__eventListeners[event].push(listener);
				this.addEventListener(event, listener);
			};

			element.removeListener = function (event, listener) {
				this.__eventListeners[event] = this.__eventListeners[
					event
				]?.filter((x) => x !== listener);

				this.removeEventListener(event, listener);
			};

			element.getEventListeners = function () {
				return this.__eventListeners;
			};

			if (!element.__methods) {
				element.__methods = {};
			}

			element.methods = function () {
				let methods = {};

				for (let m in this.__methods) {
					methods[m] = this.__methods[m].bind(this);
				}

				return methods;
			};
		};

		this.fromString = (string, outerElement = "div", ...args) => {
			let elem = h[outerElement](...args);
			elem.innerHTML = string;
			return elem;
		};

		/**
		 * handles the DOM element creation
		 * @param {string} name
		 * @param  {...any} args
		 */
		this.handle = (name, ...args) => {
			if (!(typeof name === "string")) {
				throw Error(
					`MarkupEngine.Exception: A Component's name must be a string: type '${typeof name}' given`
				);
			}

			if (/^[_\$]+$/.test(name)) {
				name = Component.FRAGMENT.toLowerCase();
			}

			let isSvg = false;

			if (/^\$\w+$/.test(name)) {
				name = name.substring(1);
				isSvg = true;
			}

			/**
			 * If this is a component, return it
			 */

			if (this.compMap.has(name)) {
				return this.compMap.get(name).wrap(...args);
			}

			let component;
			let event = "";
			let eventParams = [];

			const isComponentName = (tag) => {
				return /^ojs-.*$/.test(tag);
			};

			/**
			 *
			 * @param {string} tag
			 */
			const getComponentName = (tag) => {
				let name = tag
					.toLowerCase()
					.replace(/^ojs-/, "")
					.replace(/-tmp--$/, "");

				return Utils.camel(name, true);
			};

			/**
			 * @type {DocumentFragment|HTMLElement}
			 */
			let parent = null;

			let emptyParent = false;
			let replaceParent = false;
			let prependToParent = false;
			let rootFrag = new DocumentFragment();

			const isUpperCase = (string) => /^[A-Z]*$/.test(string);
			let isComponent = isUpperCase(name[0]);

			/**
			 * @type {HTMLElement}
			 */
			let root = null;

			let componentAttribute = {};
			let withCAttr = false;

			/**
			 * When dealing with a component
			 * save the argument for async rendering
			 */
			if (isComponent) {
				root = this.dom.createElement(`ojs-${Utils.kebab(name)}-tmp--`);

				let id = `ojs-${Utils.kebab(name)}-${MarkupEngine.ID++}`;

				root.setAttribute("ojs-key", id);
				root.setAttribute("class", "__ojs-c-class__");

				this.compArgs.set(id, args);
			} else {
				root = isSvg
					? this.dom.createElementNS(
							"http://www.w3.org/2000/svg",
							name
					  )
					: this.dom.createElement(name);
			}

			this.modify(root);

			let parseAttr = (obj) => {
				for (let k in obj) {
					let v = obj[k];

					if (v instanceof State) {
						v = v.value;
					}

					if (k === "parent" && v instanceof HTMLElement) {
						parent = v;
						continue;
					}

					if (k === "resetParent" && typeof v === "boolean") {
						emptyParent = v;
						continue;
					}

					if (k === "firstOfParent" && typeof v === "boolean") {
						prependToParent = v;
						continue;
					}

					if (k === "event" && typeof v === "string") {
						event = v;
						continue;
					}

					if (k === "replaceParent" && typeof v === "boolean") {
						replaceParent = v;
						continue;
					}

					if (k === "eventParams") {
						if (!Array.isArray(v)) v = [v];
						eventParams = v;
						continue;
					}

					if (k === "component" && v instanceof Component) {
						component = v;
						continue;
					}

					if (k === "c_attr") {
						componentAttribute = v;
						continue;
					}

					if (k.length && k[0] === "$") {
						componentAttribute[k.substring(1)] = v;
						continue;
					}

					if (k === "withCAttr") {
						withCAttr = true;
						continue;
					}

					if (k === "listeners") {
						if (typeof v !== "object") {
							throw TypeError(
								`The value of 'listeners' should be an object. but found ${typeof v}`
							);
						}

						for (let evt in v) {
							let listener = v[evt];

							if (Array.isArray(listener)) {
								listener.forEach((l) =>
									root.addListener(evt, l)
								);
							} else {
								root.addListener(evt, listener);
							}
						}

						continue;
					}

					if (k === "methods") {
						if (typeof v !== "object") {
							throw TypeError(
								`The value of 'methods' attribute should be an object. but found ${typeof v}`
							);
						}

						for (let method in v) {
							let func = v[method];
							root.__methods[method] = func;
						}

						continue;
					}

					let val = `${v}`;
					if (Array.isArray(v)) val = `${v.join(" ")}`;

					k = k.replace(/_/g, "-");

					if (k === "class" || k === "Class") {
						let cls = root.getAttribute(k) ?? "";
						val = cls + (cls.length > 0 ? " " : "") + `${val}`;
					}

					try {
						root.setAttribute(k, val);
					} catch (e) {
						console.error(
							`MarkupEngine.ParseAttribute.Exception: `,
							e,
							`. Attributes resulting in the error: `,
							obj
						);
						throw Error(e);
					}
				}
			};

			const parse = (arg, isComp) => {
				if (
					arg instanceof DocumentFragment ||
					arg instanceof HTMLElement ||
					arg instanceof SVGElement ||
					arg instanceof State
				) {
					if (isComp) return true;

					if (arg instanceof State) {
						typeof arg.value === "string" &&
							rootFrag.append(document.createTextNode(arg));
					} else {
						rootFrag.append(arg);
					}

					return true;
				}

				if (typeof arg === "object") {
					parseAttr(arg);
					return true;
				}

				if (typeof arg !== "undefined") {
					rootFrag.append(arg);
					return true;
				}

				return false;
			};

			for (let arg of args) {
				if (isComponent && parent) break;

				// if (arg instanceof State) continue;

				if (
					Array.isArray(arg) ||
					arg instanceof HTMLCollection ||
					arg instanceof NodeList
				) {
					if (isComponent) continue;

					arg.forEach((e) => {
						if (e) parse(e, isComponent);
					});

					continue;
				}

				if (parse(arg, isComponent)) continue;

				if (isComponent) continue;

				let v = this.toElement(arg);
				if (typeof v !== "undefined") rootFrag.append(v);
			}

			root.append(rootFrag);

			if (withCAttr) {
				let atr = JSON.stringify(componentAttribute);
				if (atr) root.setAttribute("c-attr", atr);
			}

			root.toString = function () {
				return this.outerHTML;
			};

			if (parent) {
				if (emptyParent) {
					parent.textContent = "";
				}

				if (replaceParent) {
					this.reconcile(parent, root);
				} else if (prependToParent) {
					parent.prepend(root);
				} else {
					parent.append(root);
				}
			}

			if (component) {
				component.emit(event, eventParams);

				let sc = root.querySelectorAll(".__ojs-c-class__");
				sc.forEach((c) => {
					if (!isComponentName(c.tagName.toLowerCase())) return;
					let cmpName = getComponentName(c.tagName);
					const h = container.resolve("h");
					h.getComponent(cmpName)?.emit(event, eventParams);
				});
			}

			return root;
		};

		/**
		 * Executes a function that returns an
		 * HTMLElement and adds that element to the overall markup.
		 * @param {function} f - This function should return an HTMLElement or a string or an Array of either
		 * @returns {HTMLElement|string|Array<HTMLElement|string>}
		 */
		this.call = (f = () => h["ojs-group"]()) => {
			return f();
		};

		/**
		 * Allows you to add functions to HTML elements
		 * @param {Array} ComponentAndMethod name of the method
		 * @param  {...any} args arguments to pass to the method
		 * @returns
		 */
		this.func = (name, ...args) => {
			let method = null;
			let component = null;

			if (!Array.isArray(name)) {
				method = name;
				return `${method}(${this._escape(args)})`;
			}

			method = name[1];
			component = name[0];

			return `component('${component.name}')['${method}'](${this._escape(
				args
			)})`;
		};

		/**
		 *
		 * adds quotes to string arguments
		 * and serializes objects for
		 * param passing
		 * @note To escape adding quotes use ${string}
		 */
		this._escape = (args) => {
			let final = [];

			for (let e of args) {
				if (typeof e === "number") final.push(e);
				else if (typeof e === "boolean") final.push(e);
				else if (typeof e === "string") {
					if (e.length && e.substring(0, 2) === "${") {
						let length =
							e[e.length - 1] === "}" ? e.length - 1 : e.length;
						final.push(e.substring(2, length));
					} else final.push(`'${e}'`);
				} else if (typeof e === "object") final.push(JSON.stringify(e));
			}

			return final;
		};

		this.__addToEventsMap = (component, event, listeners) => {
			if (!this.eventsMap.has(component)) {
				this.eventsMap.set(component, {});
				this.eventsMap.get(component)[event] = listeners;
				return;
			}

			if (!this.eventsMap.get(component)[event]) {
				this.eventsMap.get(component)[event] = [];
			}

			this.eventsMap.get(component)[event].push(...listeners);
		};

		/**
		 * Adds an event listener to a component
		 * @param {string|Array<string>} component component name
		 * @param {string} event event name
		 * @param  {...function} listeners listeners
		 */
		this.on = (component, event, ...listeners) => {
			let components = component;

			if (!Array.isArray(component)) components = [component];

			for (let component of components) {
				if (/\./.test(component)) {
					let tmp = component.split(".").filter((e) => e);
					component = tmp[0];
					listeners.push(event);
					event = tmp[1];
				}

				if (this.has(component)) {
					this.getComponent(component).on(event, ...listeners);

					continue;
				}

				listeners.forEach((f, i) => {
					listeners[i] = { type: "after", function: f };
				});

				this.__addToEventsMap(component, event, listeners);
			}
		};

		/**
		 * Add events listeners to a component that will
		 * execute even after the event has been emitted
		 * @param {string|Array<string>} component
		 * @param {string} event
		 * @param  {...function} listeners
		 */
		this.onAll = (component, event, ...listeners) => {
			let components = component;

			if (!Array.isArray(component)) components = [component];

			for (let component of components) {
				if (/\./.test(component)) {
					let tmp = component.split(".").filter((e) => e);
					component = tmp[0];
					listeners.push(event);
					event = tmp[1];
				}

				if (this.has(component)) {
					this.getComponent(component).onAll(event, ...listeners);
					continue;
				}

				listeners.forEach((f, i) => {
					listeners[i] = { type: "all", function: f };
				});

				this.__addToEventsMap(component, event, listeners);
			}
		};

		/**
		 * Gets the event emitter of a component
		 * @param {string} component component name
		 * @returns
		 */
		this.emitter = (component) => {
			return this.compMap.get(component)?.emitter;
		};

		/**
		 * Gets a component and returns it
		 * @param {string} name
		 * @returns {Component|null}
		 */
		this.getComponent = (name) => {
			return this.compMap.get(name);
		};

		/**
		 * Creates an anonymous component
		 * around a state
		 * @param {State} state
		 * @param {Array<string>} attribute attribute path
		 * @returns
		 */
		this.$anonymous = (
			state,
			callback = (state) => state.value,
			...args
		) => {
			return h[Component.anonymous()](state, callback, ...args);
		};

		/**
		 * Converts a value to HTML element;
		 * @param {string|HTMLElement} value
		 */
		this.toElement = (value) => {
			return value;
		};
	}
}
