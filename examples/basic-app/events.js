/**
 * Event Definitions for Basic App
 * Centralized event catalog following OpenScript best practices
 */

import { app } from "../../index.js";

const broker = app("broker");

/**
 * Application Events
 * Structure: Nested object where keys become namespaced event names
 * Example: app.started becomes "app:started"
 */
export const $e = {
  app: {
    started: true,
    ready: true,
  },

  todo: {
    added: true,
    updated: true,
    deleted: true,
    completed: true,
    uncompleted: true,

    needs: {
      add: true,
      update: true,
      delete: true,
      toggle: true,
      filter: true,
    },

    has: {
      addError: true,
      updateError: true,
      deleteError: true,
      list: true,
    },
  },

  filter: {
    changed: true,
    cleared: true,

    needs: {
      apply: true,
      clear: true,
    },
  },

  ui: {
    needs: {
      modal: true,
      confirm: true,
      toast: true,
    },

    modal: {
      opened: true,
      closed: true,
    },
  },
};

// Register all events with the broker
broker.registerEvents($e);
