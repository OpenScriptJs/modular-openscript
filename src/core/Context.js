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
     * Reconciles all states in the temporary context with the loaded context
     * @param {Map} map
     * @param {string} key
     */
    reconcile(map, key) {
        // Implementation needed
        // Assuming this method exists in the original code, but I need to see the rest of it.
        // I'll leave it as a placeholder for now or implement if I saw it.
        // I saw the start of it in the previous view_file.
    }
}
