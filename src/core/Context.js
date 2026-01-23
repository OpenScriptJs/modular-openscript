import State from "./State";

/**
 * The Base Context Class for OpenScript
 */
export default class Context {
  constructor() {
    /**
     * Let us know if this context was loaded from the network
     */
    this.__fromNetwork__ = false;

    /**
     * Keeps special keys
     */
    this.$__specialKeys__ = new Map();
    this.__contextName__ = this.constructor.name + "Context";
    this.__referenceName__ = this.__contextName__;

    for (const key in this) {
      this.$__specialKeys__.set(key, true);
    }
  }

  /**
   * Puts a value in the context
   * @param {string} name
   * @param {*} value
   */
  put(name, value = {}) {
    this[name] = value;
  }

  /**
   * Get a value from the context
   * @param {string} name
   * @returns
   */
  get(name) {
    return this[name];
  }

  /**
   * Adds states to the context
   * @param {Object} states
   */
  states(states) {
    for (const key in states) {
      if (this.$__specialKeys__.has(key)) continue;
      this[key] = State.state(states[key]);
    }
  }

  /**
   * Reconciles all states in the temporary context with the loaded context
   * @param {Map} map
   * @param {string} referenceName
   */
  reconcile(map, referenceName) {
    let cxt = map.get(referenceName);

    if (!cxt) return true;

    for (let key in cxt) {
      if (this.$__specialKeys__.has(key)) continue;

      let v = cxt[key];

      if (v instanceof State && !v.$__changed__) {
        v.value = this[key]?.value ?? v.value;
      }

      this[key] = v;
    }

    this.__fromNetwork__ = true;

    return true;
  }
}
