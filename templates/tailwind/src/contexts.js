/**
 * Context and State Initialization for the App
 * Using IoC Container for dependency injection
 */

import { Context, context, dom, putContext, app } from "openscriptjs";

putContext(["global"], "AppContext");

/**
 * Global Context - Application-wide state
 * @type {Context}
 */
export const gc = context("global");

export function setupContexts() {
  gc.states({
    appName: "Tailwind App",
    version: "1.0.0",
    isInitialized: false,
  });

  // Set root element for global context
  gc.rootElement = dom.id("app-root");

  // Register context in IoC container
  app().value("gc", gc);
  app().value("globalContext", gc);
}
