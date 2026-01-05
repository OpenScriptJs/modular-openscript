import Emitter from "../core/Emitter.js";
import DOMReconciler from "./DOMReconciler.js";
import BrokerRegistrar from "../broker/BrokerRegistrar.js";
import State from "../core/State.js";
import { container } from "../core/Container.js";

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
     * List of events that the component emits
     */
    this.EVENTS = {
      rendered: "rendered", // component is visible on the dom
      rerendered: "rerendered", // component was rerendered
      premount: "premount", // component is ready to register
      mounted: "mounted", // the component is now registered
      prebind: "prebind", // the component is ready to bind
      bound: "bound", // the component has bound
      markupBound: "markup-bound", // a temporary markup has bound
      beforeHidden: "before-hidden",
      hidden: "hidden",
      unmounted: "unmounted", // removed from the markup engine memory
      beforeVisible: "before-visible", // before the markup is made visible
      visible: "visible", // the markup is now made visible
    };

    /**
     * List of all components that are listening to
     * specific events
     */
    this.listening = {};

    /**
     * All the states that this component is listening to
     * @type {object<State>}
     */
    this.states = {};

    /**
     * List of components that this component is listening
     * to.
     */
    this.listeningTo = {};

    /**
     * Has the component being mounted
     */
    this.mounted = false;

    /**
     * Has the component bound
     */
    this.bound = false;

    /**
     * Has the component rendered
     */
    this.rendered = false;

    /**
     * Has the component rerendered
     */
    this.rerendered = false;

    /**
     * Is the component visible
     */
    this.visible = true;

    /**
     * The argument Map for rerendering on state changes
     */
    this.argsMap = new Map();

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

    this.name = name ?? this.constructor.name;

    this.emitter.once(this.EVENTS.rendered, (th) => (th.rendered = true));
    this.on(this.EVENTS.hidden, (th) => (th.visible = false));
    this.on(this.EVENTS.rerendered, (th) => (th.rerendered = true));
    this.on(this.EVENTS.bound, (th) => (th.bound = true));
    this.on(this.EVENTS.mounted, (th) => (th.mounted = true));
    this.on(this.EVENTS.visible, (th) => (th.visible = true));

    this.$$ojs = {
      routeChanged: () => {
        setTimeout(() => {
          if (this.markup().length == 0) {
            const h = container.resolve("h");
            if (this.isAnonymous) {
              return h.deleteComponent(this.name);
            }

            this.releaseMemory();
          }
        }, 1000);
      },
    };

    /**
     * Compare two Nodes
     */
    this.Reconciler = DOMReconciler;
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
    return h.func([this, name], ...args);
  }

  /**
   * Get an external Component's method
   * to add it to a DOM Element
   * @param {string} componentMethod `Component.method` e.g. 'MainNav.notify'
   * @param {[*]} args
   */
  xMethod(componentMethod, args) {
    let splitted = componentMethod
      .trim()
      .split(/\./)
      .map((a) => a.trim());

    if (splitted.length < 2) {
      console.error(
        `${componentMethod} has syntax error. Please use ComponentName.methodName`
      );
    }

    const h = container.resolve("h");
    let cls = h.getComponent(splitted[0]);

    if (!cls) {
      console.error(`Component ${splitted[0]} not found`);
      return;
    }

    let obj = new cls();

    if (!obj.method) {
      console.error(`Method ${splitted[1]} not found in ${splitted[0]}`);
      return;
    }

    return obj.method(splitted[1], args);
  }

  /**
   * Adds a Listening component
   * @param {event} event
   * @param {Component} component
   */
  addListeningComponent(component, event) {
    if (this.emitsTo(component, event)) return;

    if (!this.listening[event]) this.listening[event] = new Map();
    this.listening[event].set(component.name, component);

    component.addEmittingComponent(this, event);
  }

  /**
   * Adds a component that this component is listening to
   * @param {string} event
   * @param {Component} component
   */
  addEmittingComponent(component, event) {
    if (this.listensTo(component, event)) return;

    if (!this.listeningTo[component.name])
      this.listeningTo[component.name] = new Map();

    this.listeningTo[component.name].set(event, component);

    component.addListeningComponent(this, event);
  }

  /**
   * Checks if this component is listening
   * @param {string} event
   * @param {Component} component
   */
  emitsTo(component, event) {
    return this.listening[event]?.has(component.name) ?? false;
  }

  /**
   * Checks if this component is listening to the other
   * component
   * @param {*} event
   * @param {*} component
   */
  listensTo(component, event) {
    return this.listeningTo[component.name]?.has(event) ?? false;
  }

  /**
   * Deletes a component from the listening array
   * @param {string} event
   * @param {Component} component
   */
  doNotListenTo(component, event) {
    this.listeningTo[component.name]?.delete(event);

    if (this.listeningTo[component.name]?.size == 0) {
      delete this.listeningTo[component.name];
    }

    if (!component.emitsTo(this, event)) return;

    component.doNotEmitTo(this, event);
  }

  /**
   * Stops this component from emitting to the other component
   * @param {string} event
   * @param {Component} component
   * @returns
   */
  doNotEmitTo(component, event) {
    this.listening[event]?.delete(component.name);

    if (!component.listensTo(this, event)) return;
    component.doNotListenTo(this, event);
  }

  /**
   * Get all Emitters declared in the component
   */
  getDeclaredListeners() {
    if (this.__ojsRegistered) {
      console.warn(
        `Component "${this.name}" is already registered. Skipping duplicate registration.`
      );
      return;
    }

    let obj = this;
    let seen = new Set();
    const h = container.resolve("h");

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
        let cmpName = this.name;

        let subjects = meta.slice(1);

        if (!subjects?.length) subjects = [this.name, "on"];

        let methods = { on: true, onAll: true };

        let stack = [];

        for (let i = 0; i < subjects.length; i++) {
          let current = subjects[i];
          stack.push(current);

          while (stack.length) {
            i++;
            current = subjects[i] ?? null;

            if (current && methods[current]) {
              stack.push(current);
            } else {
              stack.push("on");
              i--;
            }

            let m = stack.pop();
            let cmp = stack.pop();

            for (let j = 0; j < events.length; j++) {
              let ev = events[j];
 
              if (!ev.length) continue;

              h[m](cmp, ev, (component, event, ...args) => {
                try {
                  h
                    .getComponent(cmpName)
                    [method]?.bind(h.getComponent(cmpName))(
                    component,
                    event,
                    ...args
                  );
                } catch (e) {
                  console.error(e);
                }
              });
            }
          }
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
   * @emits pre-mount
   */
  async mount() {
    // Prevent duplicate registration
    if (this.__ojsRegistered) {
      console.warn(
        `Component "${this.name}" is already registered. Skipping duplicate registration.`
      );
      return;
    }
    const h = container.resolve("h");
    h.component(this.name, this);

    this.claimListeners();
    this.emit(this.EVENTS.premount);
    await this.bindComponent();
    this.emit(this.EVENTS.mounted);
  }

  /**
   * Deletes all the component's markup from the DOM
   */
  unmount() {
    let all = this.markup();

    for (let elem of all) {
      elem.remove();
    }

    this.releaseMemory();

    return true;
  }

  /**
   * Checks if this component has
   * elements on the dom and if they are
   * visible
   */
  checkVisibility() {
    const h = container.resolve("h");
    let elem = h.dom.querySelector(`ojs-${this.kebab(this.name)}`);

    if (elem && elem.parentElement?.style.display !== "none" && !this.visible) {
      return this.show();
    }

    if (elem && elem.parentElement?.style.display === "none" && this.visible) {
      return this.hide();
    }

    if (
      elem &&
      elem.style.display !== "none" &&
      elem.style.visibility !== "hidden" &&
      !this.visible
    ) {
      this.show();
    }

    if (
      (!elem ||
        elem.style.display === "none" ||
        elem.style.visibility === "hidden") &&
      this.visible
    ) {
      this.hide();
    }
  }

  /**
   * Emits an event
   * @param {string} event
   * @param {Array<*>} args
   */
  emit(event, args = []) {
    this.emitter.emit(event, this, event, ...args);
  }

  /**
   * Binds this component to the elements on the dom.
   * @emits pre-bind
   * @emits markup-bound
   * @emits bound
   */
  async bindComponent() {
    this.emit(this.EVENTS.prebind);
    const h = container.resolve("h");
    let all = h.dom.querySelectorAll(`ojs-${this.kebab(this.name)}-tmp--`);

    if (all.length == 0 && !this.bindCalled) {
      this.bindCalled = true;
      setTimeout(this.bindComponent.bind(this), 500);
      return;
    }

    for (let elem of all) {
      let hId = elem.getAttribute("ojs-key");

      let args = [...h.compArgs.get(hId)];
      h.compArgs.delete(hId);

      this.wrap(...args, { parent: elem, replaceParent: true });

      this.emit(this.EVENTS.markupBound, [elem, args]);
    }

    this.emit(this.EVENTS.bound);

    return true;
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

    return parent.querySelectorAll(`ojs-${this.kebab(this.name)}`);
  }

  /**
   * Hides all the markup of this component
   * @emits before-hidden
   * @emits hidden
   * @returns {bool}
   */
  hide() {
    this.emit(this.EVENTS.beforeHidden);

    let all = this.markup();

    for (let elem of all) {
      elem.style.display = "none";
    }

    this.emit(this.EVENTS.hidden);

    return true;
  }

  /**
   * Remove style-display-none from all this component's markup
   * @emits before-visible
   * @emits visible
   * @returns bool
   */
  show() {
    this.emit(this.EVENTS.beforeVisible);

    let all = this.markup();

    for (let elem of all) {
      elem.style.display = "";
    }

    this.emit(this.EVENTS.visible);

    return true;
  }

  /**
   * Ensure that the action will get called
   * even if the event was emitted previously
   * @param {string} event
   * @param {...function} listeners
   */
  onAll(event, ...listeners) {
    // check if we have previously emitted this event
    listeners.forEach((a) => {
      if (event in this.emitter.emitted) a(...this.emitter.emitted[event]);

      this.emitter.on(event, a);
    });
  }

  /**
   * Add Event Listeners to that component
   * @param {string} event
   * @param {...function} listeners
   */
  on(event, ...listeners) {
    // check if we have previously emitted this event
    listeners.forEach((a) => {
      if (Array.isArray(a)) {
        a.forEach((f) => this.emitter.on(event, f));
        return;
      }

      this.emitter.on(event, a);
    });
  }

  /**
   * Gets all the listeners for itself and adds them to itself
   */
  claimListeners() {
    const h = container.resolve("h");
    if (!h.eventsMap.has(this.name)) return;

    let events = h.eventsMap.get(this.name);

    for (let event in events) {
      events[event].forEach((listener) => {
        let func = listener.function;

        if (listener.type === "all") this.onAll(event, func);
        else this.on(event, func);
      });
    }

    h.eventsMap.delete(this.name);
  }

  releaseMemory() {
    this.cleanUp();

    for (let event in this.listening) {
      for (let [_name, component] of this.listening[event]) {
        component.doNotListenTo(this, event);
      }
    }

    for (let id in this.states) {
      this.states[id]?.off(this.name);
      delete this.states[id];
    }

    this.argsMap = new Map();
    this.listeningTo = {};
    this.listening = {};

    if (this.isAnonymous) {
      this.emitter.listeners = {};
      this.emitter.emitted = {};
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
        args[i].listener(this);
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

        const keys = ["resetParent", "replaceParent", "firstOfParent"];

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
   * @emits re-rendered
   * @param  {...any} args
   * @returns
   */
  wrap(...args) {
    const h = container.resolve("h");
    const lastArg = args[args.length - 1];
    let { index, parent, resetParent, states, replaceParent, firstOfParent } =
      this.getParentAndListen(args);

    // check if the render was called due to a state change
    if (lastArg && lastArg["called-by-state-change"]) {
      let state = lastArg.self;

      delete args[index];

      let current =
        h.dom.querySelectorAll(
          `ojs-${this.kebab(this.name)}[s-${state.$__id__}="${state.$__id__}"]`
        ) ?? [];

      let reconciler = new this.Reconciler();

      current.forEach((e) => {
        if (!this.visible) e.style.display = "none";
        else e.style.display = "";

        // e.textContent = "";

        let arg = this.argsMap.get(e.getAttribute("uuid"));
        let attr = {
          // parent: e,
          component: this,
          event: this.EVENTS.rerendered,
          eventParams: [{ markup: e, component: this }],
        };

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
      });

      return;
    }

    let event = this.EVENTS.rendered;

    if (
      parent &&
      (this.getValue(resetParent) || this.getValue(replaceParent))
    ) {
      if (!this.markup().length) this.argsMap.clear();
      else {
        let all = this.markup(parent);

        all.forEach((elem) => this.argsMap.delete(elem.getAttribute("uuid")));
      }

      if (this.argsMap.size) event = this.EVENTS.rerendered;
    }

    let uuid = `${Component.uid++}-${new Date().getTime()}`;

    this.argsMap.set(uuid, args ?? []);

    let attr = {
      uuid,
      resetParent,
      replaceParent,
      firstOfParent,
      class: "__ojs-c-class__",
    };

    if (parent) attr.parent = parent;

    states.forEach((id) => {
      attr[`s-${id}`] = id;
    });

    let markup = this.render(...args, { withCAttr: true });

    if (markup.tagName == Component.FRAGMENT && markup.childNodes.length > 0) {
      let children = markup.childNodes;

      return children.length > 1 ? children : children[0];
    }

    if (!this.visible) attr.style = "display: none;";

    let cAttributes = {};

    if (markup instanceof HTMLElement) {
      cAttributes = JSON.parse(markup?.getAttribute("c-attr") ?? "{}");
      markup.setAttribute("c-attr", "");
    }

    attr = {
      ...attr,
      component: this,
      event,
      eventParams: [{ markup, component: this }],
    };

    return h[`ojs-${this.kebab(this.name)}`](attr, markup, cAttributes);
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
        this.name = `anonym-${id}`;
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

    let c = new Cls();
    c.getDeclaredListeners();
    c.mount();

    return c.name;
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
}
