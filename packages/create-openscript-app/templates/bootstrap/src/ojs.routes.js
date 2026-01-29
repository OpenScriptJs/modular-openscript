/**
 * Route Definitions
 * Defines application routing using OpenScript router
 */

import { app, ojs } from "modular-openscriptjs";
import { gc } from "./ojs.contexts.js";
import App from "./components/App.js";
import HomePage from "./components/HomePage.js";
import AboutUs from "./components/AboutUs.js";

const router = app("router");
const h = app("h");

ojs(App, HomePage, AboutUs);

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
      resetParent: router.reset, // Clear parent before rendering based on the router's decision.
      reconcileParent: true, // optimize re-rendering if possible
    });
  };

  router.on(
    "/",
    () => {
      console.log("Route: Home");

      // home page will rerender when
      // is initialized changes.

      appRender(h.HomePage(gc.isInitialized));
    },
    "home",
  );

  // many routes with one action
  // like route.on /about or route.on /about-us
  router.orOn(
    ["/about", "/about-us"],
    () => {
      console.log("Route: About");
      appRender(h.AboutUs());
    },
    ["about", "about-us"],
  );
}
