/**
 * Event Emitter Class
 */
export default class Emitter {
  constructor() {
    this.listeners = new Map();
  }

  addListener(eventName, fn) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(fn);
    return this;
  }
  // Attach event listener
  on(eventName, fn) {
    return this.addListener(eventName, fn);
  }

  // Attach event handler only once. Automatically removed.
  once(eventName, fn) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const onceWrapper = (...args) => {
      fn(...args);
      this.off(eventName, onceWrapper);
    };
    this.listeners.get(eventName).push(onceWrapper);
    return this;
  }

  // Alias for removeListener
  off(eventName, fn) {
    return this.removeListener(eventName, fn);
  }

  removeListener(eventName, fn) {
    let lis = this.listeners.get(eventName);
    if (!lis) return this;
    for (let i = lis.length - 1; i >= 0; i--) {
      if (lis[i] === fn) {
        lis.splice(i, 1);
        break; // Found and removed, break loop
      }
    }
    return this;
  }

  // Fire the event
  emit(eventName, ...args) {
    let fns = this.listeners.get(eventName);
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
    let fns = this.listeners.get(eventName) || [];
    return fns.length;
  }

  // Get raw listeners
  // If the once() event has been fired, then that will not be part of
  // the return array
  rawListeners(eventName) {
    return this.listeners.get(eventName);
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }
}
