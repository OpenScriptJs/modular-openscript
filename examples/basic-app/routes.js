/**
 * Routes for Todo App
 * Defines application routing using OpenScript router
 */

import { router, h, dom } from "../../index.js";
import { gc } from "./contexts.js";
import TodoApp from "./pages/TodoApp.js";

/**
 * Helper to render a component to the root element
 * @param {Component} component - Component to render
 */
const app = (component) => {
    return component({
        parent: gc.rootElement,
        resetParent: true
    });
};

// ============================================
// ROUTE DEFINITIONS
// ============================================

// Set base path (empty for this simple app)
router.basePath("");

// Default route - redirect to home
router.default(() => router.to("home"));

// Home route - shows all todos
router.on("/", () => {
    console.log("Route: Home");
    app(h.TodoApp());
}, "home");

// Filter routes
router.prefix("filter").group(() => {
    router.on("/all", () => {
        console.log("Route: Filter - All");
        app(h.TodoApp());
    }, "filter.all");

    router.on("/active", () => {
        console.log("Route: Filter - Active");
        app(h.TodoApp());
    }, "filter.active");

    router.on("/completed", () => {
        console.log("Route: Filter - Completed");
        app(h.TodoApp());
    }, "filter.completed");
});

console.log("✓ Routes registered");
