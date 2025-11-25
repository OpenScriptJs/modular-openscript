/**
 * Main Entry Point for Todo App
 * Initializes the application and starts routing
 */

// Import event definitions and register them
import { $e } from "./events.js";

// Import contexts (this initializes all states and listeners)
import { gc, tc, uic } from "./contexts.js";

// Import helper functions
import { loadTodosFromLocalStorage } from "./helpers.js";

// Import routes (this registers all routes)
import "./routes.js";

// Import OpenScript utilities
import { app } from "../../index.js";

const broker = app("broker");
const router = app("router");

// ============================================
// APPLICATION INITIALIZATION
// ============================================

console.log("🚀 Initializing Todo App...");

// Load saved todos from localStorage
const savedTodos = loadTodosFromLocalStorage();
if (savedTodos.length > 0) {
  tc.todos.value = savedTodos;
  // Update nextId based on loaded todos
  const maxId = Math.max(...savedTodos.map((t) => t.id || 0));
  tc.nextId = maxId + 1;
}

// Emit app started event
broker.send($e.app.started);

// Mark app as initialized
gc.isInitialized.value = true;

console.log("✓ Todo App initialized successfully");

// ============================================
// START ROUTER
// ============================================

// Start listening to route changes
router.listen();

console.log("✓ Router started");
