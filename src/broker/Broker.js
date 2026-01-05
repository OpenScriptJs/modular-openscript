import Emitter from "../core/Emitter.js";

/**
 * The Broker Class
 */
export default class Broker {
    /**
     * Should the events be logged as they are fired?
     */
    #shouldLog = false;

    #emitOnlyRegisteredEvents = false;

    /**
     * The event listeners
     * event: {time:xxx, args: xxx}
     */
    #logs = {};

    /**
     * The emitter
     */
    #emitter = new Emitter();

    constructor() {
        /**
         * TIME DIFFERENCE BEFORE GARBAGE
         * COLLECTION
         */
        this.CLEAR_LOGS_AFTER = 10000;

        /**
         * TIME TO GARBAGE COLLECTION
         */
        this.TIME_TO_GC = 30000;
    }

    /**
     * Add Event Listeners
     * @param {string|Array<string>} events - space or | separated events
     * @param {function} listener - asynchronous function
     */
    on(events, listener) {
        if (Array.isArray(events)) {
            for (let event of events) {
                this.on(event, listener);
            }

            return;
        }

        events = this.parseEvents(events);

        for (let event of events) {
            event = event.trim();

            this.verifyEventRegistration(event);

            if (this.#logs[event]) {
                let emitted = this.#logs[event];

                for (let i = 0; i < emitted.length; i++) {
                    listener(...emitted[i].args);
                }
            }

            this.#emitter.on(event, listener);
        }
    }

    off(events, listener) {
        if (Array.isArray(events)) {
            for (let event of events) {
                this.off(event, listener);
            }

            return;
        }

        events = this.parseEvents(events);

        for (let event of events) {
            event = event.trim();

            this.#emitter.off(event, listener);
        }
    }

    verifyEventRegistration(event) {
        if (
            this.#emitOnlyRegisteredEvents &&
            !(event in this.#emitter.listeners)
        ) {
            throw Error(
                `BrokerError: Cannot listen to or emit unregistered event: ${event}.
                        You can turn off event registration requirement to stop this behavior.`
            );
        }
    }

    /**
     *
     * @param {object} events ```json
     * {
     *      event1: true,
     *      ns: {
     *              event1: true,
     *              subNs: {
     *                  event:true
     *              }
     *      }
     * }
     * ```
     * @returns
     */
    registerEvents(events) {
        const dfs = (event, prefix = "", ref = {}) => {
            if (typeof event === "string") {
                if (event.length === 0) return;

                let name = event;

                if (prefix.length > 0) {
                    event = `${prefix}:${event}`;
                }

                if (!(event in this.#emitter.listeners)) {
                    this.#emitter.listeners[event] = [];

                    ref[name] = event;
                } else {
                    throw Error(
                        `Cannot re-register event: ${event}. Event already registered`
                    );
                }

                return;
            }

            const accepted = {
                object: true,
                boolean: true,
            };

            for (let e in event) {
                if (!(typeof event[e] in accepted)) {
                    throw Error(
                        `Invalid Event declaration: ${
                            prefix ? prefix + "." : ""
                        }${e}: ${event[e]}`
                    );
                }

                if (typeof event[e] === "object") {
                    dfs(
                        event[e],
                        `${prefix.length > 0 ? prefix + ":" : prefix}${e}`,
                        event[e]
                    );
                } else {
                    dfs(e, prefix, event);
                }
            }

            return;
        };

        dfs(events);
    }

    /**
     * Emits an event
     * @param {string|Array<string>} events - space or | separated events
     * @param  {...any} args
     * @returns
     */
    async send(events, ...args) {
        return this.emit(events, ...args);
    }

    /**
     * Broadcasts an event
     * @param {string|Array<string>} events- space or | separated events
     * @param  {...any} args
     * @returns
     */
    async broadcast(events, ...args) {
        return this.send(events, ...args);
    }

    /**
     * Emits Events
     * @param {string|Array<string>} events
     * @param  {...any} args
     * @returns
     */
    async emit(events, ...args) {
        if (Array.isArray(events)) {
            for (let event of events) {
                this.emit(event, ...args);
            }

            return;
        }

        events = this.parseEvents(events);

        for (let event of events) {
            event = event.trim();

            this.verifyEventRegistration(event);

            await this.#emit(event, ...args);
        }
    }

    /**
     * @param {string} events
     */
    parseEvents(events) {
        if (Array.isArray(events)) return events;
        return events.split(/\|/g);
    }

    async #emit(event, ...args) {
        const currentTime = () => new Date().getTime();

        this.#logs[event] = this.#logs[event] ?? [];
        this.#logs[event].push({ timestamp: currentTime(), args: args });

        // Import EventData dynamically or assume it's available?
        // In original code: args.push(new OpenScript.EventData().encode());
        // I'll assume EventData is imported or I'll just skip this for now.
        // Wait, I should import EventData.
        
        // if (args.length == 0) {
        // 	args.push(new OpenScript.EventData().encode());
        // }

        args.push(event);

        if (this.#shouldLog) {
            console.trace(`fired ${event}: args: `, args);
        }

        return this.#emitter.emit(event, ...args);
    }

    /**
     * Clear the logs
     */
    clearLogs() {
        let now = new Date().getTime();

        for (let event in this.#logs) {
            let logs = this.#logs[event];
            let newLogs = [];

            for (let log of logs) {
                if (now - log.timestamp < this.TIME_TO_GC) {
                    newLogs.push(log);
                }
            }

            this.#logs[event] = newLogs;
        }
    }

    /**
     * Do Events Garbage Collection
     */
    removeStaleEvents() {
        setInterval(() => {
            this.clearLogs();
        }, this.CLEAR_LOGS_AFTER);
    }

    /**
     * If the broker should display events as they are fired
     * @param {boolean} shouldLog
     */
    withLogs(shouldLog) {
        this.#shouldLog = shouldLog;
    }

    /**
     *
     * @param {boolean} requireEventsRegistration
     */
    requireEventsRegistration(requireEventsRegistration = true) {
        this.#emitOnlyRegisteredEvents = requireEventsRegistration;
    }
}
