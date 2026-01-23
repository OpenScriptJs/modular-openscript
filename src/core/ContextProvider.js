import Context from "./Context.js";
import ProxyFactory from "./ProxyFactory.js";
// import AutoLoader from "./AutoLoader.js"; // Need to find AutoLoader

/**
 * The base Context Provider
 */
export default class ContextProvider {
    /**
     * The directory in which the Context
     * files are located
     */
    static directory;

    /**
     * The version number for the network request to
     * get updated files
     */
    static version;

    constructor() {
        /**
         * The Global Context
         */
        this.globalContext = {};

        /**
         * Context mapping
         */
        this.map = new Map();

        /**
         * Adds a Context Path to the Map
         * @param {string|Array<string>} referenceName
         * @param {string} qualifiedName The Context File path, ignoring the context directory itself.
         * @param {boolean} fetch Should the file be fetched from the backend
         * @param {boolean} load Should this context be loaded automatically
         */
        this.put = async (referenceName, qualifiedName, fetch = false) => {
            
            if (!Array.isArray(referenceName))
                referenceName = [referenceName];

            let c = this.map.get(referenceName[0]);

            let shouldFetch = false;

            if (!c || (c && !c.__fromNetwork__ && fetch))
                shouldFetch = true;

            if (shouldFetch) {
                // Assuming AutoLoader is available
                /*
                let ContextClass = fetch
                    ? await new AutoLoader(
                            ContextProvider.directory,
                            ContextProvider.version
                      ).include(qualifiedName)
                    : null;

                if (!ContextClass) {
                    ContextClass = new Map([
                        qualifiedName,
                        ["_", Context],
                    ]);
                }

                let counter = 0;

                for (let [k, v] of ContextClass) {
                    try {
                        let cxt = new v[1]();

                        let key =
                            referenceName[counter] ?? cxt.__contextName__;

                        if (shouldFetch) cxt.reconcile(this.map, key);

                        this.map.set(key, cxt);
                    } catch (e) {
                        console.error(
                            `Unable to load '${referenceName}' context because it already exists in the window. Please ensure that you are loading your contexts before your components`,
                            e
                        );
                    }

                    counter++;
                }
                */
               console.warn("ContextProvider.put is not fully implemented due to missing AutoLoader.");
            } else {
                console.warn(
                    `[${referenceName}] context already exists. If you have multiple contexts in the file in ${qualifiedName}, then you can use context('[contextName]Context') or the aliases you give them to access them.`
                );
            }

            return this.context(referenceName);
        };
    }

    /**
     * Gets the Context with the given name.
     * @note The name must be in the provider's map
     * @param {string} name
     */
    context(name) {
        return this.map.get(name);
    }

    /**
     * Asynchronously loads a context
     * @param {string|Array<string>} referenceName
     * @param {string} qualifiedName
     * @param {boolean} fetch
     */
    load(referenceName, qualifiedName, fetch = false) {
        if (!Array.isArray(referenceName)) referenceName = [referenceName];

        for (let name of referenceName) {
            let c = this.map.get(name);

            if (!c) {
                this.map.set(name, new Context());
            }
        }

        this.put(referenceName, qualifiedName, fetch);

        return referenceName.length === 1
            ? this.map.get(referenceName[0])
            : this.map;
    }

    /**
     * Refreshes the whole context
     */
    refresh() {
        this.map.clear;
    }

    static create() {
        return ProxyFactory.make(
            ContextProvider,
            class {
                set(target, prop, receiver) {
                    throw new Error(
                        "You cannot Set any Property on the ContextProvider"
                    );
                }
            }
        );
    }
}
