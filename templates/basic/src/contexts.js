/**
 * Context and State Initialization for the App
 * Global state management following OpenScript best practices
 */

import { Context, context, dom, putContext } from "openscriptjs";

putContext(["global"], "AppContext");

/**
 * Global Context - Application-wide state
 * @type {Context}
 */
export const gc = context("global");

export function setupContexts() {
  gc.states({
    appName: "Setup App",
    version: "1.0.0",
    isInitialized: false,
  });

  // Set root element for global context
  gc.rootElement = dom.id("app-root");
}
