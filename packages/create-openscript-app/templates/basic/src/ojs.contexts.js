/**
 * Context and State Initialization for the App
 * Using IoC Container for dependency injection
 */

import { Context, context, dom, putContext, app } from "modular-openscriptjs";

putContext(["global"], "AppContext");

/**
 * Global Context - Application-wide state
 * @type {Context}
 */
export const gc = context("global");

export function setupContexts() {
  gc.appName = "OpenScript Js";
  gc.version = "1.0.0";

  gc.states({
    isInitialized: false,
  });

  // Set root element for global context
  gc.rootElement = dom.id("app-root");

  // Register context in IoC container
  app.value("gc", gc);
  app.value("globalContext", gc);
}
