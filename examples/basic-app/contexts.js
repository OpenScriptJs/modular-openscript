/**
 * Context and State Initialization for Todo App
 * Global state management following OpenScript best practices
 */

import { context, dom, putContext } from "../../index.js";
import { saveTodosToLocalStorage } from "./helpers.js";

// ============================================
// 1. REGISTER CONTEXTS
// ============================================

// Register contexts (creates Context instances)
putContext(["global", "todo", "ui"], "TodoAppContext");

// ============================================
// 2. GET CONTEXT REFERENCES
// ============================================

/**
 * Global Context - Application-wide state
 * @type {Context}
 */
export const gc = context("global");

/**
 * Todo Context - Todo items and filtering
 * @type {Context}
 */
export const tc = context("todo");

/**
 * UI Context - UI state (modals, loading, etc.)
 * @type {Context}
 */
export const uic = context("ui");

// ============================================
// 3. INITIALIZE GLOBAL CONTEXT STATES
// ============================================

gc.states({
    appName: "Todo List App",
    version: "1.0.0",
    isInitialized: false,
});

// Set root element for global context
gc.rootElement = dom.id("app-root");

// ============================================
// 4. INITIALIZE TODO CONTEXT STATES
// ============================================

tc.states({
    todos: [],           // Array of todo items
    filter: "all",       // "all" | "active" | "completed"
    sortBy: "createdAt", // "createdAt" | "text" | "priority"
    nextId: 1,
});

// ============================================
// 5. INITIALIZE UI CONTEXT STATES
// ============================================

uic.states({
    loading: false,
    editingTodoId: null,
    showDeleteConfirm: false,
    todoToDelete: null,
});

// ============================================
// 6. STATE LISTENERS
// ============================================

// Listen to todo changes
tc.todos.listener((todosState) => {
    console.log(`Todos updated: ${todosState.value.length} todos`);
    // Save to localStorage
    saveTodosToLocalStorage(todosState.value);
});

// Listen to filter changes
tc.filter.listener((filterState) => {
    console.log(`Filter changed to: ${filterState.value}`);
});