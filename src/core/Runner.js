import Component from "../component/Component.js";
import Mediator from "../mediator/Mediator.js";
import Listener from "../broker/Listener.js";
import Context from "./Context.js";
import { isClass } from "../utils/helpers.js";

/**
 * Used to Initialize and Register/Mount Classes upon creation
 */
export default class Runner {
    isClass(func) {
        return isClass(func);
    }

    async run(...cls) {
        for (let i = 0; i < cls.length; i++) {
            let c = cls[i];
            let instance;

            if (!this.isClass(c)) {
                instance = new Component(c.name);
                instance.render = c.bind(instance);
            } else {
                instance = new c();
            }

            if (instance instanceof Component) {
                instance.getDeclaredListeners();
                instance.mount();
            } else if (
                instance instanceof Mediator ||
                instance instanceof Listener
            ) {
                instance.register();
            } else if (instance instanceof Context) {
            } else {
                throw Error(
                    `You can only pass declarations which extend Component, Mediator or Listener`
                );
            }
        }
    }
}
