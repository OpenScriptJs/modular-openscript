/**
 * Routes for Bootstrap App
 * Defines application routing using OpenScript router
 */

import { router, h, dom } from "openscriptjs";
import { gc } from "./contexts.js";

export function setupRoutes() {
  // Default route - redirect to home
  router.default(() => router.to("home"));

  /**
   * Helper to render a component to the root element
   * @param {Component} component - Component to render
   */
  const app = (component) => {
    return h.App(component, {
      parent: gc.rootElement,
      resetParent: true, // Clear parent before rendering
    });
  };

  router.on(
    "/",
    () => {
      console.log("Route: Home");
      app(h.Counter());
    },
    "home"
  );
}
