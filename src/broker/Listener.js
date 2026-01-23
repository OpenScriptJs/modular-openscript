import BrokerRegistrar from "./BrokerRegistrar.js";

/**
 * A Broker Listener
 */
export default class Listener {
  /**
   * Registers with the broker
   */
  async register() {
    // Prevent duplicate registration
    if (this.__ojsRegistered) {
      console.warn(
        `Listener "${this.constructor.name}" is already registered. Skipping duplicate registration.`
      );
      return;
    }

    let br = new BrokerRegistrar();
    br.register(this);

    // Mark as registered
    this.__ojsRegistered = true;
  }
}
