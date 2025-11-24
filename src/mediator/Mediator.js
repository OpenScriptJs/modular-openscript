import BrokerRegistrar from "../broker/BrokerRegistrar.js";
import { broker } from "../index.js";

/**
 * The Mediator Class
 */
export default class Mediator {
    shouldRegister() {
        return true;
    }

    async register() {
        if (!this.shouldRegister()) return;

        let br = new BrokerRegistrar();
        br.register(this);
    }

    /**
     * Emits an event through the broker
     * @param {string|Array<string>} events
     * @param  {...string} args data to send
     */
    send(events, ...args) {
        broker.send(events, ...args);
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
