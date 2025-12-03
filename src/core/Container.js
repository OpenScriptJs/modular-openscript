/**
 * IoC (Inversion of Control) Container
 * Manages dependencies and enables dependency injection
 */

export default class Container {
  constructor() {
    /**
     * Map of registered services
     * @type {Map<string, ServiceDefinition>}
     */
    this.services = new Map();

    /**
     * Map of singleton instances
     * @type {Map<string, any>}
     */
    this.instances = new Map();

    /**
     * Stack for circular dependency detection
     * @type {Set<string>}
     */
    this.resolvingStack = new Set();
  }

  /**
   * Register a singleton service
   * @param {string} name - Service identifier
   * @param {Function|any} implementation - Class constructor, factory function, or value
   * @param {string[]} dependencies - Array of dependency names
   * @returns {Container} - For chaining
   */
  singleton(name, implementation, dependencies = []) {
    this.services.set(name, {
      implementation,
      dependencies,
      lifecycle: "singleton",
    });
    return this;
  }

  /**
   * Register a transient service (new instance every time)
   * @param {string} name - Service identifier
   * @param {Function} implementation - Class constructor or factory function
   * @param {string[]} dependencies - Array of dependency names
   * @returns {Container} - For chaining
   */
  transient(name, implementation, dependencies = []) {
    this.services.set(name, {
      implementation,
      dependencies,
      lifecycle: "transient",
    });
    return this;
  }

  /**
   * Register a factory function
   * @param {string} name - Service identifier
   * @param {Function} factory - Factory function that returns the service
   * @returns {Container} - For chaining
   */
  factory(name, factory) {
    this.services.set(name, {
      implementation: factory,
      dependencies: [],
      lifecycle: "factory",
    });
    return this;
  }

  /**
   * Register a constant value
   * @param {string} name - Service identifier
   * @param {any} value - The value to register
   * @returns {Container} - For chaining
   */
  value(name, value) {
    this.instances.set(name, value);
    this.services.set(name, {
      implementation: value,
      dependencies: [],
      lifecycle: "value",
    });
    return this;
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service identifier
   * @param {any} defaultValue - Default value to return if service is not found
   * @returns {any} - The resolved service instance
   */
  resolve(name, defaultValue = null) {
    // Check for circular dependencies
    if (this.resolvingStack.has(name)) {
      const stack = Array.from(this.resolvingStack).join(" -> ");
      throw new Error(`Circular dependency detected: ${stack} -> ${name}`);
    }

    const service = this.services.get(name);
    if (!service) {
      return defaultValue;
    }

    // Return cached singleton instance
    if (service.lifecycle === "singleton" && this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Return value directly
    if (service.lifecycle === "value") {
      return service.implementation;
    }

    // Mark as resolving
    this.resolvingStack.add(name);

    try {
      // Resolve dependencies
      const deps = service.dependencies.map((dep) => this.resolve(dep));

      let instance;

      if (service.lifecycle === "factory") {
        // Call factory function
        instance = service.implementation(this);
      } else if (typeof service.implementation === "function") {
        // Check if it's a class (constructor)
        if (this.isClass(service.implementation)) {
          instance = new service.implementation(...deps);
        } else {
          // It's a regular function
          instance = service.implementation(...deps);
        }
      } else {
        // It's a value
        instance = service.implementation;
      }

      // Cache singleton instance
      if (service.lifecycle === "singleton") {
        this.instances.set(name, instance);
      }

      return instance;
    } finally {
      // Remove from resolving stack
      this.resolvingStack.delete(name);
    }
  }

  /**
   * Check if a function is a class
   * @param {Function} func - Function to check
   * @returns {boolean}
   */
  isClass(func) {
    return (
      typeof func === "function" &&
      /^class\s/.test(Function.prototype.toString.call(func))
    );
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service identifier
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   * @returns {string[]}
   */
  getServiceNames() {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all services and instances
   */
  clear() {
    this.services.clear();
    this.instances.clear();
    this.resolvingStack.clear();
  }

  /**
   * Create a child container that inherits from this one
   * @returns {Container}
   */
  createChild() {
    const child = new Container();
    child.parent = this;
    return child;
  }

  /**
   * Override resolve to check parent container
   * @param {string} name
   * @returns {any}
   */
  resolveWithParent(name) {
    if (this.has(name)) {
      return this.resolve(name);
    }

    if (this.parent) {
      return this.parent.resolveWithParent(name);
    }

    throw new Error(`Service "${name}" not found in container hierarchy`);
  }

  /**
   * Inject dependencies into a function
   * @param {Function} fn - Function to inject
   * @param {string[]} dependencies - Dependency names
   * @returns {any} - Result of function call
   */
  inject(fn, dependencies = []) {
    const deps = dependencies.map((dep) => this.resolve(dep));
    return fn(...deps);
  }

  /**
   * Create an injectable function wrapper
   * @param {string[]} dependencies - Dependency names
   * @param {Function} fn - Function to wrap
   * @returns {Function}
   */
  injectable(dependencies, fn) {
    return (...args) => {
      const deps = dependencies.map((dep) => this.resolve(dep));
      return fn(...deps, ...args);
    };
  }
}

/**
 * Create and export a singleton instance
 * This ensures the container is available before any other module loads
 * and prevents circular dependency issues
 */
const container = new Container();

export { container };
