import BrokerRegistrar from "./BrokerRegistrar.js";

/**
 * A Broker Listener
 */
export default class Listener {
    /**
     * Registers with the broker
     */
    async register() {
        let br = new BrokerRegistrar();
        br.register(this);
    }
}
