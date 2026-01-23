/**
 * Main entry point for your OpenScript application
 */

// this must come first to ensure that
// all events the system needs have been
// registered before any component is
// initialized
import { configureApp } from "./ojs.config.js";
import { app } from "modular-openscriptjs";
import { setupContexts } from "./contexts.js";
import { setupRoutes } from "./routes.js";
import "./style.scss"; // Import Bootstrap styles

configureApp();
setupContexts();
setupRoutes();

// start the app
app("router").listen();

console.log("✓ OpenScript app initialized");
