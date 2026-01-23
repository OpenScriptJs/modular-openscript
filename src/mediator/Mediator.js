import BrokerRegistrar from "../broker/BrokerRegistrar.js";
import { container } from "../core/Container.js";

/**
 * The Mediator Class
 */
export default class Mediator {
  static mediatorId = 0;

  constructor() {
    this.id = Mediator.mediatorId++;
    container.resolve("repository").addMediator(this);
  }

  /**
   * Should the mediator be registered
   * @returns {boolean}
   */
  shouldRegister() {
    return true;
  }

  async register() {
    if (!this.shouldRegister()) return;

    // Prevent duplicate registration
    if (this.__ojsRegistered) {
      console.warn(
        `Mediator "${this.constructor.name}" is already registered. Skipping duplicate registration.`
      );
      return;
    }

    let br = new BrokerRegistrar();
    br.register(this);

    // Mark as registered
    this.__ojsRegistered = true;
  }

  /**
   * Emits an event through the broker
   * @param {string|Array<string>} events
   * @param  {...string} args data to send
   */
  send(events, ...args) {
    container.resolve("broker").send(events, ...args);
    return this;
  }

  /**
   * Emits/Broadcasts an event through the broker
   * @param {string|Array<string>} events
   * @param  {...any} args
   */
  broadcast(events, ...args) {
    return this.send(events, ...args);
  }

  /**
   * parses a JSON string
   * `JSON.parse`
   * @param {string} JSONString
   * @returns
   */
  parse(JSONString) {
    return JSON.parse(JSONString);
  }

  /**
   * Stringifies a JSON Object
   * `JSON.stringify`
   * @param {object} object
   * @returns
   */
  stringify(object) {
    return JSON.stringify(object);
  }
}
