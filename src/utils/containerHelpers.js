/**
 * Service Container Helper
 * Provides convenient methods for setting up the IoC container
 */

import { container } from "../core/Container.js";

/**
 * Register a service in the container
 * @param {string} name - Service name
 * @param {Function|any} implementation - Service implementation
 * @param {string[]} dependencies - Service dependencies
 * @param {string} lifecycle - 'singleton' | 'transient' | 'factory' | 'value'
 */
export function registerService(
  name,
  implementation,
  dependencies = [],
  lifecycle = "singleton"
) {
  switch (lifecycle) {
    case "singleton":
      container.singleton(name, implementation, dependencies);
      break;
    case "transient":
      container.transient(name, implementation, dependencies);
      break;
    case "factory":
      container.factory(name, implementation);
      break;
    case "value":
      container.value(name, implementation);
      break;
    default:
      throw new Error(`Unknown lifecycle: ${lifecycle}`);
  }
}

/**
 * Resolve a service from the container
 * @param {string} name - Service name
 * @returns {any} - Resolved service
 */
export function resolve(name) {
  return container.resolve(name);
}

/**
 * Create an injectable function
 * @param {string[]} dependencies - Dependency names
 * @param {Function} fn - Function to inject
 * @returns {Function} - Injectable function
 */
export function injectable(dependencies, fn) {
  return container.injectable(dependencies, fn);
}
