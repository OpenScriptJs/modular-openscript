/**
 * Application Events
 * Structure: Nested object where keys become namespaced event names
 * Example: app.started becomes "app:started"
 */
export const appEvents = {
  app: {
    started: true,
    ready: true,
    booted: true,

    needs: {
      reboot: true,
    },
  },
};
