/**
 * Helper Functions for Todo App
 * Utility functions for working with todos and app state
 */

import { tc, uic } from "./contexts.js";

/**
 * Get filtered todos based on current filter
 * @returns {Array} Filtered todos
 */
export function getFilteredTodos() {
    const todos = tc.todos.value;
    const filter = tc.filter.value;

    switch (filter) {
        case "active":
            return todos.filter(t => !t.completed);
        case "completed":
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

/**
 * Get todo statistics
 * @returns {Object} Stats object with total, completed, and active counts
 */
export function getTodoStats() {
    const todos = tc.todos.value;
    return {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        active: todos.filter(t => !t.completed).length
    };
}

/**
 * Save todos to localStorage
 * @param {Array} todos - Array of todo items
 */
export function saveTodosToLocalStorage(todos) {
    try {
        localStorage.setItem('openscript-todos', JSON.stringify(todos));
    } catch (e) {
        console.error('Failed to save todos:', e);
    }
}

/**
 * Load todos from localStorage
 * @returns {Array} Loaded todos or empty array
 */
export function loadTodosFromLocalStorage() {
    try {
        const saved = localStorage.getItem('openscript-todos');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to load todos:', e);
        return [];
    }
}

/**
 * Set loading state
 * @param {boolean} isLoading - Loading state
 */
export function setLoading(isLoading) {
    uic.loading.value = isLoading;
}
