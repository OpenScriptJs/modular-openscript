import Mediator from "./Mediator.js";
// import AutoLoader from "../core/AutoLoader.js"; // Need to find AutoLoader

/**
 * The Mediator Manager
 */
export default class MediatorManager {
    static directory = "./mediators";
    static version = "1.0.0";

    constructor() {
        this.mediators = new Map();
    }

    /**
     * Fetch Mediators from the Backend
     * @param {string} qualifiedName
     */
    async fetchMediators(qualifiedName) {
        // Assuming AutoLoader is available globally or imported
        // For now, commenting out AutoLoader usage until I find it
        /*
        let MediatorClass = await new AutoLoader(
            MediatorManager.directory,
            MediatorManager.version
        ).include(qualifiedName);

        if (!MediatorClass) {
            MediatorClass = new Map([qualifiedName, ["_", Mediator]]);
        }

        for (let [k, v] of MediatorClass) {
            try {
                if (this.mediators.has(k)) continue;

                let mediator = new v[1]();
                mediator.register();

                this.mediators.set(k, mediator);
            } catch (e) {
                console.error(`Unable to load '${k}' Mediator.`, e);
            }
        }
        */
       console.warn("MediatorManager.fetchMediators is not fully implemented yet due to missing AutoLoader.");
    }
}
