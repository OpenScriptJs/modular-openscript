import State from "./State";

/**
 * Repository to manage object references and prevent memory leaks.
 * This class provides a centralized location to track Components, States, and Mediators.
 */
export default class Repository {
  /**
   * Initialize the Repository
   */
  constructor() {
    /**
     * Map of Component references (Strong references for lookup by ID).
     * CAUTION: Objects in this map must be manually removed to prevent memory leaks.
     * @type {Map<string|number, Component>}
     */
    this.components = new Map();

    /**
     * Keeps arguments that was passed to the component 
     * during rendering when a state was passed.
     */
    this.componentArgsMap = new WeakMap();

    /**
     * Map of State references.
     * @type {Map<string|number, State>}
     */
    this.states = new Map();

    /**
     * Map of Mediator references.
     * @type {Map<string, Mediator>}
     */
    this.mediators = new Map();

    this.domListeners = new WeakMap();
    this.domMethods = new WeakMap();

    this.nodeDisposalCallbacks = new Set();
  }

  /**
   * Add a component to the repository
   * @param {Component} component
   */
  addComponent(component) {
    if (component && component.id) {
      this.components.set(component.id, component);
    }
  }

  /**
   * Find a component by its ID
   * @param {string|number} id
   * @returns {Component|undefined}
   */
  findComponent(id) {
    return this.components.get(Number(id));
  }

  /**
   * Remove a component from the repository (Strong Reference)
   * @param {Component|string|number} componentOrId
   */
  removeComponent(componentOrId) {
    let id = componentOrId;
    if (typeof componentOrId === "object" && componentOrId.id) {
      id = componentOrId.id;
    }
    this.components.delete(Number(id));
  }

  /**
   * Add a state to the repository
   * @param {State} state
   */
  addState(state) {
    if (state && state.$__id__) {
      this.states.set(state.$__id__, state);
    }
  }

  /**
   * Find a state by its ID
   * @param {string|number} id
   * @returns {State|undefined}
   */
  findState(id) {
    return this.states.get(Number(id));
  }

  /**
   * Remove a state from the repository (Strong Reference)
   * @param {State|string|number} stateOrId
   */
  removeState(stateOrId) {
    let id = stateOrId;
    if (typeof stateOrId === "object" && stateOrId.$__id__) {
      id = stateOrId.$__id__;
    }
    this.states.delete(Number(id));
  }

  /**
   * Add a mediator to the repository
   * @param {Mediator} mediator
   */
  addMediator(mediator) {
    this.mediators.set(mediator.id, mediator);
  }

  /**
   * Find a mediator by its ID
   * @param {string} id
   * @returns {Mediator|undefined}
   */
  findMediator(id) {
    return this.mediators.get(Number(id));
  }

  /**
   * Add arguments to the component
   * @param {string|number} componentId
   * @param {Array<*>} args
   */
  addComponentArgs(componentId, args) {
    let component = this.findComponent(componentId);
    if (!component) return; 
    this.componentArgsMap.set(component, args);
  }

  /**
   * Remove a mediator from the repository
   * @param {string} id
   */
  removeMediator(id) {
    this.mediators.delete(Number(id));
  }

  /**
   * Get the arguments passed to the component
   * @param {string|number} componentId
   * @returns {Array<*>}
   */
  getComponentArgs(componentId) {
    let component = this.findComponent(componentId);
    if (!component) return;
    return this.componentArgsMap.get(component);
  }

  /**
   * Remove arguments from the component
   * @param {string|number} componentId
   */
  removeComponentArgs(componentId) {
    let component = this.findComponent(componentId);
    if (!component) return;
    this.componentArgsMap.delete(component);
  }

  /**
   * Get the node disposal callbacks
   * @returns {Set<Function>}
   */
  getNodeDisposalCallbacks() {
    return this.nodeDisposalCallbacks;
  }
}
