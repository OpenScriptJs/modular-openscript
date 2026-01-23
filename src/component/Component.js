import Emitter from "../core/Emitter.js";
import DOMReconciler from "./DOMReconciler.js";
import BrokerRegistrar from "../broker/BrokerRegistrar.js";
import State from "../core/State.js";
import { container } from "../core/Container.js";
import {
  cleanupDisconnectedComponents,
  destroyNodeDeep,
  getOjsChildren,
} from "../utils/helpers.js";

/**
 * Base Component Class
 */
export default class Component {
  /**
   * Anonymous component ID
   */
  static aCId = 0;

  /**
   * Generate IDs for the components
   */
  static uid = 0;

  /**
   * Use for returning fragments
   */
  static FRAGMENT = "OJS-SPECIAL-FRAGMENT";

  constructor(name = null) {
    /**
     * Component ID
     */
    this.id = Component.uid++;

    /**
     * List of events that the component emits
     */
    this.EVENTS = {
      rendered: "rendered", // component ui is computed
      rerendered: "rerendered", // component was ui was recomputed.
      mounted: "mounted", // the component is now on the dom
      unmounted: "unmounted", // removed from the repository
    };

    /**
     * All the states that this component is listening to
     * @type {object<State>}
     */
    this.states = {};

    /**
     * Has the component being mounted
     */
    this.mounted = false;

    /**
     * Has the component being unmounted
     */
    this.unmounted = false;

    /**
     * Has the component rendered
     */
    this.rendered = false;

    /**
     * Has the component rerendered
     */
    this.rerendered = false;

    /**
     * Event Emitter for the component
     */
    this.emitter = new Emitter();

    /**
     * List of events that the component is listening to
     * from the broker
     */
    this.__brokerEvents__ = {};

    this.isAnonymous = false;

    this.emitter.once(this.EVENTS.rendered, (componentId) => {
      let repo = container.resolve("repository");
      let component = repo.findComponent(componentId);
      if (component) component.rendered = true;
    });

    this.on(this.EVENTS.rerendered, (componentId) => {
      let repo = container.resolve("repository");
      let component = repo.findComponent(componentId);
      if (component) component.rerendered = true;
    });

    this.on(this.EVENTS.mounted, (componentId) => {
      let repo = container.resolve("repository");
      let component = repo.findComponent(componentId);
      if (component) component.handleMounted();
    });

    /**
     * Compare two Nodes
     */
    this.Reconciler = DOMReconciler;
    container.resolve("repository").addComponent(this);
    container.resolve("repository").addComponentArgs(this.id, []);
  }

  /**
   * Find a component by its UID
   * @param {int|string} id
   * @returns {Component|null}
   */
  static findComponent(id) {
    return container.resolve("repository").findComponent(id);
  }

  /**
   * Write Clean Up Logic in this function
   */
  cleanUp() {}

  /**
   * Make the component's method accessible from the
   * global window
   * @param {string} methodName - the method name
   * @param {[*]} args - arguments to pass to the method
   * To pass a literal string param use '${param}' in the args.
   * For example ['${this}'] this will reference the DOM element.
   */
  method(name, args) {
    if (!Array.isArray(args)) {
      args = [args];
    }
    const h = container.resolve("h");
    return h.func({ componentId: this.id, methodName: name }, ...args);
  }
  /**
   * Get all Emitters declared in the component
   */
  getDeclaredListeners() {
    if (this.__ojsRegistered) {
      console.warn(
        `Component "component:${this.id}" is already registered. Skipping duplicate registration.`,
      );
      return;
    }

    let obj = this;
    let seen = new Set();

    do {
      if (!(obj instanceof Component)) break;

      for (let method of Object.getOwnPropertyNames(obj)) {
        if (seen.has(method)) continue;

        if (typeof this[method] !== "function") continue;
        if (method.length < 3) continue;

        if (!method.startsWith("$_")) continue;

        let meta = method.substring(1).split(/\$/g);

        let events = meta[0].split(/_/g);
        events.shift();

        for (let j = 0; j < events.length; j++) {
          let ev = events[j];

          if (!ev.length) continue;

          this.on(ev, this[method]);
        }

        seen.add(method);
      }
    } while ((obj = Object.getPrototypeOf(obj)));

    const br = new BrokerRegistrar();

    br.register(this);
  }
  /**
   * Initializes the component and adds it to
   * the component map of the markup engine
   * @emits mounted
   */
  mount() {
    if (this.mounted == true) return;
    this.mounted = true;
    this.emit(this.EVENTS.mounted);
  }

  /**
   * Deletes all the component's markup from the DOM
   */
  unmount() {
    
    /**
     * Clean up the dom based on the developer's logic.
     */
    this.cleanUp();

    /**
     * @var {NodeList<HTMLElement>} all
     */
    let all = this.markup();

    for (let elem of all) {
      destroyNodeDeep(elem);
      elem.remove();
    }
    
    this.releaseMemory();
    this.unmounted = true;
    this.emit(this.EVENTS.unmounted);

    return true;
  }

  /**
   * Emits an event
   * @param {string} event
   * @param {Array<*>} args
   */
  emit(event, ...args) {
    args.push(event);

    this.emitter.emit(event, ...args);
  }

  /**
   * Converts camel case to kebab case
   * @param {string} name
   */
  kebab(name) {
    let newName = "";

    for (const c of name) {
      if (c.toLocaleUpperCase() === c && newName.length > 1) newName += "-";
      newName += c.toLocaleLowerCase();
    }

    return newName;
  }

  /**
   * Return all the current DOM elements for this component
   * From the parent.
   * @param {HTMLElement | null} parent
   * @returns
   */
  markup(parent = null) {
    const h = container.resolve("h");
    if (!parent) parent = h.dom;

    return parent.querySelectorAll(
      `ojs-${this.kebab(this.name)}[ojs-uid="${this.id}"]`,
    );
  }

  /**
   * Add Event Listeners to that component
   * @param {string} event
   * @param {...function} listeners
   */
  on(event, ...listeners) {
    listeners.forEach((a) => {
      if (Array.isArray(a)) {
        a.forEach((f) => this.emitter.on(event, f));
        return;
      }

      this.emitter.on(event, a);
    });
  }

  releaseMemory() {
    container.resolve("repository").removeComponent(this.id);
    container.resolve("repository").removeComponentArgs(this.id);

    this.emitter.clear();

    for (let id in this.states) {
      this.states[id]?.off(`component-${this.id}`);
      delete this.states[id];
    }

    const broker = container.resolve("broker");

    for (let event in this.__brokerEvents__) {
      for (let listener of this.__brokerEvents__[event]) {
        broker.off(event, listener);
      }

      delete this.__brokerEvents__[event];
    }
  }

  /**
   * Renders the Element and returns an HTML Element
   * @param  {...any} args
   * @returns {DocumentFragment|HTMLElement|String|Array<DocumentFragment|HTMLElement|String>}
   */
  render(...args) {
    const h = container.resolve("h");
    return h.ojs(...args);
  }

  /**
   * Finds the parent in the argument list
   * @param {Array<*>} args
   * @returns
   */
  getParentAndListen(args) {
    let final = {
      index: -1,
      parent: null,
      states: [],
      resetParent: false,
      replaceParent: false,
      firstOfParent: false,
    };

    for (let i in args) {
      if (
        args[i] instanceof State ||
        (args[i] &&
          typeof args[i].$__name__ !== "undefined" &&
          args[i].$__name__ == "OpenScript.State")
      ) {
        args[i].listener(`component-${this.id}`);
        this.states[args[i].$__id__] = args[i];
        final.states.push(args[i].$__id__);
      } else if (
        !(
          args[i] instanceof DocumentFragment || args[i] instanceof HTMLElement
        ) &&
        args[i] &&
        !Array.isArray(args[i]) &&
        typeof args[i] === "object" &&
        args[i].parent
      ) {
        if (args[i].parent) {
          final.index = i;
          final.parent = args[i].parent;
        }

        const keys = [
          "resetParent",
          "replaceParent",
          "firstOfParent",
          "reconcileParent",
        ];

        for (let reserved of keys) {
          if (args[i][reserved]) {
            final[reserved] = args[i][reserved];
            delete args[i][reserved];
          }
        }

        delete args[i].parent;
      }
    }

    return final;
  }

  /**
   * Gets the value of object
   * @param {any|State} object
   * @returns
   */
  getValue(object) {
    if (object instanceof State) return object.value;
    return object;
  }

  /**
   * Wraps the rendered content
   * @emits rerendered
   * @param  {...any} args
   * @returns
   */
  wrap(...args) {
    const h = container.resolve("h");
    const lastArg = args[args.length - 1];
    let {
      index,
      parent,
      resetParent,
      states,
      replaceParent,
      firstOfParent,
      reconcileParent,
    } = this.getParentAndListen(args);

    let reconciler = new this.Reconciler();

    // check if the render was called due to a state change
    if (lastArg && lastArg["called-by-state-change"]) {
      let stateId = lastArg.stateId;

      delete args[index];

      let current =
        h.dom.querySelectorAll(
          `ojs-${this.kebab(this.name)}[ojs-uid="${
            this.id
          }"][s-${stateId}="${stateId}"]`,
        ) ?? [];

      current.forEach((e) => {
        let arg =
          container.resolve("repository").getComponentArgs(this.id) ?? [];

        let attr = {};

        let shouldReconcile = true;

        if (e.childNodes.length === 0) {
          attr.parent = e;
          shouldReconcile = false;
        }

        let markup = this.render(...arg, attr);

        if (shouldReconcile) {
          if (Array.isArray(markup)) {
            let newParent = e.cloneNode();
            newParent.append(...markup);
            reconciler.reconcile(newParent, e);
          } else {
            reconciler.reconcile(markup, e.childNodes[0]);
          }
        }

        this.emit(this.EVENTS.rerendered, this.id);
      });

      queueMicrotask(cleanupDisconnectedComponents);
      return;
    }

    if (
      parent &&
      (this.getValue(resetParent) || this.getValue(replaceParent))
    ) {
      container.resolve("repository").addComponentArgs(this.id, []);
    }

    let uuid = this.id;

    if (states?.length) {
      container.resolve("repository").addComponentArgs(this.id, args ?? []);
    }

    let attr = {
      ojs_uid: uuid,
      resetParent,
      replaceParent,
      firstOfParent,
      class: "__ojs-c-class__",
    };

    // we render in the parent node
    // if we don't need to reconcile the parent
    if (parent) {
      if (reconcileParent) {
        attr.parent = parent.cloneNode();
      } else {
        attr.parent = parent;
      }
    }

    states.forEach((id) => {
      attr[`s-${id}`] = id;
    });

    let markup = this.render(...args, { withCAttr: true });

    if (markup.tagName == Component.FRAGMENT && markup.childNodes.length > 0) {
      let children = markup.childNodes;

      return children.length > 1 ? children : children[0];
    }

    let cAttributes = {};

    if (markup instanceof HTMLElement) {
      cAttributes = JSON.parse(markup?.getAttribute("c-attr") ?? "{}");
      markup.setAttribute("c-attr", "");
    }

    const rendered = h[`ojs-${this.kebab(this.name)}`](
      attr,
      markup,
      cAttributes,
    );

    if (reconcileParent && parent) {
      reconciler.reconcile(rendered.parentElement, parent);
    }

    this.emit(this.EVENTS.rendered, this.id);

    if (parent && parent.isConnected && this.mounted == false) {
      this.emit(this.EVENTS.mounted, this.id);
    }

    queueMicrotask(cleanupDisconnectedComponents);

    return rendered;
  }

  isHtml(markup) {
    return markup instanceof HTMLElement;
  }

  /**
   * Returns a mounted anonymous component's name.
   */
  static anonymous() {
    let id = Component.aCId++;

    let Cls = class extends Component {
      constructor() {
        super();
        this.name = `anonym${id}`;
        this.isAnonymous = true;
      }

      /**
       * Render function takes a state
       * @param {State} state
       * @param {Function} callback that returns the value to
       * put in the markup
       * @returns
       */
      render(state, callback, ...args) {
        let h = container.resolve("h");
        let markup = callback(state, ...args);
        return h[`ojs-wrapper`](markup, ...args);
      }
    };

    let h = container.resolve("h");
    h.registerComponent(`anonym-${id}`, Cls);

    return `anonym-${id}`;
  }

  /**
   *
   * @param {string} eventName
   * @param {function} listener
   */
  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }

  /**
   *
   * @param {string} eventName
   * @param {function} listener
   */
  removeListener(eventName, listener) {
    return this.emitter.removeListener(eventName, listener);
  }

  handleMounted() {
    if (this.mounted) return;

    this.mounted = true;

    // get all components under this component and
    // fire their mounted event.

    let markups = this.markup();

    let root = markups[0];

    if (!root) return;

    let children = getOjsChildren(root);

    children.forEach((child) => {
      let component = container
        .resolve("repository")
        .findComponent(child.getAttribute("ojs-uid"));
      if (component) component.emit(this.EVENTS.mounted, component.id);
    });
  }
}
