/**
 * Route Definitions
 * Defines application routing using OpenScript router
 */

import { app, dom } from "modular-openscriptjs";
import { gc } from "./contexts.js";

const router = app("router");
const h = app("h");

export function setupRoutes() {
  // Default route - redirect to home
  router.default(() => router.to("home"));

  /**
   * Helper to render a component to the root element
   * @param {Component} component - Component to render
   */
  const appRender = (component) => {
    return h.App(component, {
      parent: gc.rootElement,
      resetParent: true, // Clear parent before rendering
    });
  };

  router.on(
    "/",
    () => {
      console.log("Route: Home");
      appRender(h.div("Hello OpenScript"));
    },
    "home"
  );
}
