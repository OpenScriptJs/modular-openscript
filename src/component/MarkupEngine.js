import DOMReconciler from "./DOMReconciler.js";
import Utils from "../utils/Utils.js";
import Component from "./Component.js";
import State from "../core/State.js";
import { container } from "../core/Container.js";
import { indirectEventHandler, isClass } from "../utils/helpers.js";

/**
 * Base Markup Engine Class
 */
export default class MarkupEngine {
  /**
   * The IDs for components on the DOM awaiting
   * rendering
   */
  static ID = 0;

  /**
   * Keeps the components
   * @type {Map<string,Component>}
   */
  compMap = new Map();
  reconciler = new DOMReconciler();

  /**
   * References the DOM object
   */
  dom = window.document;

  constructor() {}

  /**
   *
   * @param {string} name component name
   * @param {class<Component>} componentClass OpenScript component class.
   */
  registerComponent = (name, componentClass) => {
    if (!(typeof name === "string")) {
      throw Error(
        `MarkupEngine.Exception: A Component's name must be a string: type '${typeof name}' given`
      );
    }

    if (!(componentClass.prototype instanceof Component)) {
      throw new Error(
        `MarkupEngine.Exception: The component for ${name} must be an Component component. ${componentClass.name} given`
      );
    }

    this.compMap.set(name, componentClass);
  };

  /**
   * Deletes the component from the Markup Engine Map.
   * @param {string} name
   * @returns {boolean}
   */
  deleteComponent = (name) => {
    if (!this.hasComponent(name)) {
      return false;
    }

    return this.compMap.delete(name);
  };

  /**
   * Checks if a component is registered with the
   * markup engine.
   * @param {string} name
   * @returns
   */
  hasComponent = (name) => {
    return this.compMap.has(name);
  };

  /**
   * Checks if a component is registered
   * @param {string} name
   * @param {string} method method name
   * @returns
   */
  isRegistered = (name, method = "access") => {
    if (this.hasComponent(name)) return true;

    console.warn(
      `MarkupEngine.Warn: Trying to ${method} an unregistered component {${name}}. Please ensure that the component is registered by using h.has(componentName)`
    );

    return false;
  };

  reconcile = (domNode, newNode) => {
    this.reconciler.reconcile(newNode, domNode);
  };

  modify = (element) => {
    element.__eventListeners ??= new Set();

    element.addListener = function (event, listener) {
      this.__eventListeners.add(event);
      this.addEventListener(event, listener);
    };

    element.removeListener = function (event, listener) {
      // remove the listener from the event map in the repository
      // since for each event, there is only the indirect event handler
      // listening to that event.
      let eventMap = container.resolve("repository").domListeners.get(this);

      let listeners = eventMap.get(event);

      if (!listeners) return;

      for (let l of listeners) {
        if (l === listener) {
          listeners.delete(l);
          break;
        }
      }

      if (listeners.size === 0) {
        eventMap.delete(event);
        this.__eventListeners.delete(event);
      }
    };

    element.getEventListeners = function () {
      return container.resolve("repository").domListeners.get(this);
    };

    element.toString = function () {
      return this.outerHTML;
    };

    element.methods = function () {
      let methods = {};

      // get the methods from the repository
      let methodsMap = container.resolve("repository").domMethods.get(this);

      for (let [k, v] of methodsMap) {
        methods[k] = v;
      }

      return methods;
    };

    element.__openscript_cleanup__ = () => {
      delete element.addListener;
      delete element.removeListener;
      delete element.getEventListeners;
      delete element.methods;
      delete element.__eventListeners;
      delete element.__methods;
      delete element.toString;
      delete element.__openscript_cleanup__;
    };
  };

  fromString = (string, outerElement = "div", ...args) => {
    const h = container.resolve("h");
    let elem = h[outerElement](...args);
    elem.innerHTML = string;
    return elem;
  };

  /**
   * handles the DOM element creation
   * @param {string} name
   * @param  {...any} args
   */
  handle = (name, ...args) => {
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
    if (this.hasComponent(name)) {
      let cls = this.getComponent(name);
      let cmp = null;

      if (!isClass(cls)) {
        cmp = new Component(cls.name);
        cmp.render = cls.bind(cmp);
      } else {
        cmp = new cls();
      }
      cmp.getDeclaredListeners();

      return cmp.wrap(...args);
    }

    let component;
    let event = "";
    let eventParams = [];

    const isComponentName = (tag) => {
      return /^ojs-.*$/.test(tag);
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

    let componentAttribute = {};
    let withCAttr = false;

    /**
     * @type {HTMLElement|SVGElement}
     */
    let root = isSvg
      ? this.dom.createElementNS("http://www.w3.org/2000/svg", name)
      : this.dom.createElement(name);

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

        if (
          k === "componentId" &&
          (typeof v === "string" || typeof v === "number")
        ) {
          component = Component.findComponent(v);
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
              listener.forEach((l) => {
                this.registerDomListeners(root, evt, l);
              });

              root.addListener(evt, indirectEventHandler);
            } else {
              this.registerDomListeners(root, evt, listener);
              root.addListener(evt, indirectEventHandler);
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
          
          let methodMap = container.resolve("repository").domMethods.get(root);
          if (!methodMap) {
            methodMap = new Map();
            container.resolve("repository").domMethods.set(root, methodMap);
          }

          for (const name in v) {
            const fn = v[name];
            methodMap.set(name, fn);
            defineDomMethod(root, name);
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

      if (
        Array.isArray(arg) ||
        arg instanceof HTMLCollection ||
        arg instanceof NodeList
      ) {
        if (isComponent) continue;

        for (let e of arg) {
          if (e) parse(e, isComponent);
        }

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
        let cmp = Component.findComponent(Number(c.getAttribute("uid")));

        if (!cmp) return;

        cmp?.emit(event, eventParams);

        if (parent.isConnected) {
          cmp.mount();
        }
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
  call = (
    f = () => {
      const h = container.resolve("h");
      return h["ojs-group"]();
    }
  ) => {
    return f();
  };

  /**
   * Allows you to add functions to HTML elements
   * @param {Array} ComponentAndMethod name of the method
   * @param  {...any} args arguments to pass to the method
   * @returns
   */
  func = (name, ...args) => {
    let method = null;
    let componentId = null;

    if (!(typeof name === "object")) {
      method = name;
      return `${method}(${this._escape(args)})`;
    }

    method = name.methodName;
    componentId = name.componentId;

    return `component('${componentId}')['${method}'](${this._escape(args)})`;
  };

  /**
   *
   * adds quotes to string arguments
   * and serializes objects for
   * param passing
   * @note To escape adding quotes use ${string}
   */
  _escape = (args) => {
    let final = [];

    for (let e of args) {
      if (typeof e === "number") final.push(e);
      else if (typeof e === "boolean") final.push(e);
      else if (typeof e === "string") {
        if (e.length && e.substring(0, 2) === "${") {
          let length = e[e.length - 1] === "}" ? e.length - 1 : e.length;
          final.push(e.substring(2, length));
        } else final.push(`'${e}'`);
      } else if (typeof e === "object") final.push(JSON.stringify(e));
    }

    return final;
  };

  /**
   * Gets a component and returns it
   * @param {string} name
   * @returns {class-string<Component|null>}
   */
  getComponent = (name) => {
    return this.compMap.get(name);
  };

  /**
   * Creates an anonymous component
   * around a state
   * @param {State} state
   * @param {Array<string>} attribute attribute path
   * @returns
   */
  $anonymous = (state, callback = (state) => state.value, ...args) => {
    const h = container.resolve("h");
    return h[Component.anonymous()](state, callback, ...args);
  };

  /**
   * Converts a value to HTML element;
   * @param {string|HTMLElement} value
   */
  toElement = (value) => {
    return value;
  };

  registerDomListeners = (node, event, listener) => {
    let eventMap = container.resolve("repository").domListeners.get(node);

    if (!eventMap) {
      eventMap = new Map();
      container.resolve("repository").domListeners.set(node, eventMap);
    }

    let listeners = eventMap.get(event) ?? [];
    listeners.push(listener);
    eventMap.set(event, listeners);
  };
}
