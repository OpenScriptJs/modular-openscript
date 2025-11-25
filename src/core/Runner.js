import Component from "../component/Component.js";
import Mediator from "../mediator/Mediator.js";
import Listener from "../broker/Listener.js";
import Context from "./Context.js";
import { isClass } from "../utils/helpers.js";
import { container } from "./Container.js";

/**
 * Used to Initialize and Register/Mount Classes upon creation
 */
export default class Runner {
  isClass(func) {
    return isClass(func);
  }

  /**
   * Get a unique key for a class to use in the container
   * @param {Function} classRef
   * @returns {string}
   */
  getClassKey(classRef) {
    return `__singleton__${classRef.name}__${classRef.toString().length}`;
  }

  async run(...cls) {
    for (let i = 0; i < cls.length; i++) {
      let c = cls[i];
      let instance;

      if (!this.isClass(c)) {
        // Functional component - always create new instance (not a singleton)
        instance = new Component(c.name);
        instance.render = c.bind(instance);
      } else {
        // For classes, check if singleton exists in container
        const classKey = this.getClassKey(c);

        if (container.has(classKey)) {
          // Retrieve existing singleton from container
          instance = container.resolve(classKey);

          // Skip if already registered (has __ojsRegistered flag)
          if (instance.__ojsRegistered) {
            continue;
          }
        } else {
          // Create new instance and register as singleton in container
          instance = new c();
          container.singleton(classKey, () => instance, []);
        }
      }

      if (instance instanceof Component) {
        instance.getDeclaredListeners();
        await instance.mount();
      } else if (instance instanceof Mediator || instance instanceof Listener) {
        await instance.register();
      } else if (instance instanceof Context) {
        // Context instances don't need registration
      } else {
        throw Error(
          `You can only pass declarations which extend Component, Mediator or Listener`
        );
      }
    }
  }
}
