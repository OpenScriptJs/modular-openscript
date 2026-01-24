import { container } from "./Container.js";
import ProxyFactory from "./ProxyFactory.js";

/**
 * The main State class
 */
export default class State {
  /**
   * The count of the number of states in the program
   */
  static count = 0;

  static VALUE_CHANGED = "value-changed";

  constructor() {
    /**
     * The value of the state
     */
    this.value;

    /**
     * ID of this state
     */
    this.$__id__;

    /**
     * Has this state changed
     */
    this.$__changed__ = false;

    this.$__name__ = "OpenScript.State";

    this.$__CALLBACK_ID__ = 0;

    /**
     * Tells the component to rerender
     */
    this.$__signature__ = {
      "called-by-state-change": true,
      stateId: this.$__id__,
    };

    this.$__listeners__ = new Map();
  }

  /**
   * Add a component that listens to this state
   * @param {Component|Function|string} listener
   * @returns
   */
  listener(listener) {
    // Assuming Component check via duck typing or name if circular dependency prevents instanceof
    if (
      listener &&
      ((typeof listener === "string" && /^component-\d+$/.test(listener)) ||
        (listener.id && typeof listener.wrap === "function"))
    ) {
      if (typeof listener === "string") {
        let uid = listener.split("-")[1];
        listener = container.resolve("repository").findComponent(uid);

        if (!listener) {
          return null;
        }
      }

      this.$__listeners__.set(`component-${listener.id}`, listener);

      // Add the state to the component's states
      listener.states[this.$__id__] = this;

      return `component-${listener.id}`;
    } else {
      let id = this.$__CALLBACK_ID__++;
      this.$__listeners__.set(`callback-${id}`, listener);
      return `callback-${id}`;
    }
  }

  /**
   * Adds a listener that is automatically removed once the event is fired
   * @param {Component|Function} listener
   * @returns
   */
  once(listener) {
    let id = null;
    let onceWrapper = null;

    if (listener && listener.id && typeof listener.wrap === "function") {
      id = "component-" + listener.id;

      onceWrapper = {
        id,

        wrap: ((...args) => {
          this.off(id);
          return listener.wrap(...args);
        }).bind(this),
      };
    } else {
      id = "callback-" + this.$__CALLBACK_ID__++;
      onceWrapper = ((...args) => {
        this.off(id);
        return listener(...args);
      }).bind(this);
    }

    this.$__listeners__.set(id, onceWrapper);

    return id;
  }

  /**
   * Removes a Component
   * @param {string} id
   * @returns
   */
  off(id) {
    return this.$__listeners__.delete(id);
  }

  /**
   * Fires on state change
   * @param  {...any} args
   * @returns
   */
  async fire(...args) {
    for (let [k, listener] of this.$__listeners__) {
      if (/^callback-\d+$/.test(k)) {
        listener(this, ...args);
      } else {
        listener.wrap(...args, this.$__signature__);
      }
    }

    return this;
  }

  *[Symbol.iterator]() {
    if (typeof this.value !== "object") {
      yield this.value;
    } else {
      for (let k in this.value) {
        yield this.value[k];
      }
    }
  }

  toString() {
    return `${this.value}`;
  }

  /**
   * Creates a new State
   * @param {any} value
   * @returns {State}
   */
  static state(v = null) {
    return ProxyFactory.make(
      class extends State {
        constructor() {
          super();
          this.value = v;
          this.$__id__ = State.count++;

          /**
           * Tells the component to rerender
           */
          this.$__signature__ = {
            "called-by-state-change": true,
            stateId: this.$__id__,
          };

          container.resolve("repository").addState(this);
        }

        push = (...args) => {
          if (!Array.isArray(this.value)) {
            throw Error(
              "State.Exception: Cannot execute push on a state whose value is not an array"
            );
          }

          this.value.push(...args);
          this.$__changed__ = true;

          this.fire();
        };
      },
      class {
        set(target, prop, value) {
          if (prop === "value") {
            let current = target.value;
            let nVal = value;

            if (typeof nVal !== "object" && current === nVal) return true;

            Reflect.set(...arguments);

            target.$__changed__ = true;

            target.fire();

            return true;
          } else if (
            !(
              prop in
              {
                $__listeners__: true,
                $__signature__: true,
                $__CALLBACK_ID__: true,
              }
            ) &&
            target.value[prop] !== value
          ) {
            target.value[prop] = value;
            target.$__changed__ = true;

            target.fire();

            return true;
          }

          return Reflect.set(...arguments);
        }

        get(target, prop, receiver) {
          if (prop === "length" && typeof target.value === "object") {
            return Object.keys(target.value).length;
          }

          if (
            typeof prop !== "symbol" &&
            /\d+/.test(prop) &&
            Array.isArray(target.value)
          ) {
            return target.value[prop];
          }

          if (
            !target[prop] &&
            target.value &&
            typeof target.value === "object" &&
            target.value[prop]
          )
            return target.value[prop];

          return Reflect.get(...arguments);
        }

        deleteProperty(target, prop) {
          if (typeof target.value !== "object") return false;

          if (Array.isArray(target.value)) {
            target.value = target.value.filter((v, i) => i != prop);
          } else {
            delete target.value[prop];
          }

          target.$__changed__ = true;
          target.fire();

          return true;
        }
      }
    );
  }
}
