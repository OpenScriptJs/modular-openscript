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
  node.__openscript_cleanup__?.();
  node.__eventListeners = null;
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
    },
  });
}

export function removeDomMethod(node, name) {
  if (!node || !node[name]) return;
  delete node[name];
}

export function destroyNodeDeep(node) {
  if (node.nodeType !== 1) return;

  for (const child of [...node.children]) {
    destroyNodeDeep(child);
  }

  cleanUpNode(node);
}

export function cleanupDisconnectedComponents() {
  const repo = container.resolve("repository");

  for (const [id, component] of repo.components) {

    if(!component?.mounted === true) continue;

    let markups = component.markup();

    if (!markups.length || markups[0]?.isConnected === false) {
      component.unmount();
      repo.removeComponent(id);
    }
  }
}

export function getOjsChildren(parent) {
  return parent?.querySelectorAll(".__ojs-c-class__") ?? [];
}


