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
    container.value(
      "__ojs_registrations",
      container.resolve("__ojs_registrations") ?? {}
    );

    const registrations = container.resolve("__ojs_registrations");
    const h = container.resolve("h");

    for (let i = 0; i < cls.length; i++) {
      let c = cls[i];
      let instance;
      const classKey = this.getClassKey(c);
      const instanceName = c.name;

      if (!this.isClass(c)) {
        let functionClass = class extends Component {
          constructor() {
            super();

            this.name = instanceName;
          }
        };

        functionClass.prototype.render = c;

        c = functionClass;
      }

      if (registrations[classKey] === "ongoing") {
        continue;
      }

      if (container.has(classKey)) {
        instance = container.resolve(classKey);
        if (instance.__ojsRegistered) {
          continue;
        }
      } else {
        instance = new c();
        container.singleton(classKey, () => instance, []);
        registrations[classKey] = "ongoing";
      }

      if (instance instanceof Component) {
        registrations[classKey] = "completed";
        h.registerComponent(instanceName, c);
      } else if (instance instanceof Mediator || instance instanceof Listener) {
        await instance.register();
        registrations[classKey] = "completed";
      } else if (instance instanceof Context) {
        registrations[classKey] = "completed";
      } else {
        throw Error(
          `You can only pass declarations which extend Component, Mediator or Listener`
        );
      }
    }
  }
}
