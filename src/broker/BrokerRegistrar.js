import { broker } from "../index.js";

/**
 * Registers events on the broker
 */
export default class BrokerRegistrar {
    async registerNamespace(namespace, events, obj) {
        if (typeof events !== "object") {
            console.error(
                `Namespace has incorrect declaration syntax: '${namespace}' with value: `,
                events,
                `in ${obj.constructor.name}`
            );

            return;
        }

        for (let event in events) {
            if (
                event.startsWith("$$") ||
                (typeof events[event] === "object" &&
                    !(typeof events[event] === "function"))
            ) {
                this.registerNamespace(
                    `${namespace}:${
                        event.startsWith("$$") ? event.substring(2) : event
                    }`,
                    events[event],
                    obj
                );
            } else {
                let ev = event.split(/_/g).filter((a) => a.length > 0);

                for (let e of ev) {
                    this.registerMethod(
                        `${namespace}:${e}`,
                        events[event],
                        obj
                    );
                }
            }
        }
    }

    async register(o) {
        let obj = o;
        let seen = new Set();

        do {
            for (let method of Object.getOwnPropertyNames(obj)) {
                if (seen.has(method)) continue;
                if (method.length < 3) continue;
                if (!method.startsWith("$$")) continue;

                if (typeof obj[method] !== "function") {
                    await this.registerNamespace(
                        method.substring(2),
                        obj[method],
                        obj
                    );
                    continue;
                }

                this.registerMethod(method.substring(2), obj[method], obj);

                seen.add(method);
            }
        } while ((obj = Object.getPrototypeOf(obj)));
    }

    async registerMethod(method, listener, object) {
        let events = method.split(/_/g).filter((a) => a.length > 0);

        for (let ev of events) {
            if (ev.length === 0) continue;
            broker.on(ev, listener.bind(object));
        }
    }
}
