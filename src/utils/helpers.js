import { container } from "../core/Container";

/**
 * Checks if a function is a class
 * @param {function} func
 * @returns {boolean}
 */
export function isClass(func) {
  return (
    typeof func === "function" &&
    /^class\s/.test(Function.prototype.toString.call(func))
  );
}

/**
 * Adds a new Namespace to the window
 * @param {string} name
 */
export function namespace(name) {
  if (!window[name]) window[name] = {};
  return window[name];
}

export function cleanUpNode(node) {
  node.__eventListeners = null;
  node.__methods = null;
  node.__openscript_cleanup__?.();
}

/**
 * Handles events for DOM elements
 * @param {Event} event
 */
export function indirectEventHandler(event) {
  let target = event.currentTarget;
  let type = event.type;

  let eventMap = container.resolve("repository").domListeners.get(target);

  if (!eventMap) return;

  let listeners = eventMap.get(type) ?? [];

  for (let listener of listeners) {
    listener(event);
  }
}


export function defineDomMethod(node, name) {
  if (node[name]) return;

  Object.defineProperty(node, name, {
    configurable: true,
    enumerable: false,
    value: function (...args) {
      const methods = container.resolve("repository").domMethods.get(this);
      const fn = methods?.get(name);
      return fn?.call(this, ...args);
    }
  });
}



