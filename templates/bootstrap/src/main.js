/**
 * Main entry point for your OpenScript application
 */

// this must come first to ensure that
// all events the system needs have been
// registered before any component is
// initialized
import { configureApp } from "./ojs.config";
import { app, payload } from "modular-openscriptjs";
import { setupContexts } from "./ojs.contexts";
import { setupRoutes } from "./ojs.routes";
import { appEvents } from "./ojs.events";
import { bootMediators } from "./mediators/boot";

configureApp();
setupContexts();
bootMediators();
setupRoutes();

// start the app
app("router").listen();

app("broker").send(
  appEvents.app.started,
  payload({ source: "main.js" }, { timestamp: new Date().getTime() }),
);

app("broker").send(appEvents.app.booted);

console.log("✓ OpenScript app initialized");
