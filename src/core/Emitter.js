/**
 * Event Emitter Class
 */
export default class Emitter {
    constructor() {
        this.listeners = {};
        /**
         * List of emitted events
         */
        this.emitted = {};
    }

    addListener(eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);
        return this;
    }
    // Attach event listener
    on(eventName, fn) {
        return this.addListener(eventName, fn);
    }

    // Attach event handler only once. Automatically removed.
    once(eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        const onceWrapper = (...args) => {
            fn(...args);
            this.off(eventName, onceWrapper);
        };
        this.listeners[eventName].push(onceWrapper);
        return this;
    }

    // Alias for removeListener
    off(eventName, fn) {
        return this.removeListener(eventName, fn);
    }

    removeListener(eventName, fn) {
        let lis = this.listeners[eventName];
        if (!lis) return this;
        for (let i = lis.length; i > 0; i--) {
            if (lis[i] === fn) {
                lis.splice(i, 1);
                break;
            }
        }
        return this;
    }

    // Fire the event
    emit(eventName, ...args) {
        this.emitted[eventName] = args;

        let fns = this.listeners[eventName];
        if (!fns) return false;
        fns.forEach((f) => {
            try {
                f(...args);
            } catch (e) {
                console.error(e);
            }
        });
        return true;
    }

    listenerCount(eventName) {
        let fns = this.listeners[eventName] || [];
        return fns.length;
    }

    // Get raw listeners
    // If the once() event has been fired, then that will not be part of
    // the return array
    rawListeners(eventName) {
        return this.listeners[eventName];
    }
}
