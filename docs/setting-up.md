# Setting Up OpenScript

This guide will walk you through the process of setting up a new OpenScript project. We will cover installation, creating the entry point, configuring Vite, and setting up the OpenScript configuration file.

## 1. Installation

First, install the `modular-openscriptjs` package using npm:

```bash
npm install modular-openscriptjs
```

## 2. Create Entry Point

First, create an `index.html` file in your project root. This will be the shell of your application.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My OpenScript App</title>
  </head>
  <body>
    <div id="app-root"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Next, create the `src/main.js` file. This file initializes the application, sets up routes, and starts the router.

```javascript
import "./ojs.config.js"; // Import configuration to ensure services are ready
import { app } from "modular-openscriptjs";

// Import your route setup function (we'll define this later)
// import { setupRoutes } from "./routes.js";

async function init() {
  // 1. Configure services (if not done in top-level of config) but usually config is imported.

  // 2. Setup your application context (like getting the root element)
  const rootElement = document.getElementById("app-root");

  // 3. Setup Routes
  // setupRoutes(rootElement);

  // 4. Start the Router
  const router = app("router");
  router.listen();
}

init();
```

_Note: In visual applications, you typically define routes that render components into the `rootElement`._

## 3. Install Vite and Configure Plugin

OpenScript uses Vite for bundling and development. Install Vite and the necessary plugins:

```bash
npm install vite --save-dev
```

Next, create a `vite.config.js` file in your project root and configure the OpenScript plugin. This plugin handles necessary transformations, such as component auto-discovery.

```javascript
import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  plugins: [
    openScriptComponentPlugin({
      // Optional: Configure components directory if different from 'src/components'
      // componentsDir: 'src/components'
    }),
  ],
});
```

## 4. OpenScript Configuration

Create an `ojs.config.js` file in your project root. This file is where you configure the core services of OpenScript, such as the Router and Broker.

```javascript
import { app } from "modular-openscriptjs";
import { appEvents } from "./events.js"; // We will create this in the next section

/*----------------------------------
 | Do OpenScript Configurations Here
 |----------------------------------
*/

const router = app("router");
const broker = app("broker");

export function configureApp() {
  /*-----------------------------------
 | Set the global runtime prefix.
 | This prefix will be appended
 | to every path before resolution.
 | So ensure when defining routes,
 | you have it as the main prefix.
 |------------------------------------
*/
  router.runtimePrefix("");

  /**----------------------------------
   *
   * Set the default route path here
   * ----------------------------------
   */
  router.basePath("");

  /*--------------------------------
 | Set the logs clearing interval
 | for the broker to remove stale
 | events. (milliseconds)
 |--------------------------------
*/
  broker.CLEAR_LOGS_AFTER = 30000;

  /*--------------------------------
 | Set how old an event must be
 | to be deleted from the broker's
 | event log during logs clearing
 |--------------------------------
*/
  broker.TIME_TO_GC = 10000;

  /*-------------------------------------------
 | Start the garbage
 | collector for the broker
 |-------------------------------------------
*/
  broker.removeStaleEvents();

  /*------------------------------------------
 | Should the broker display events
 | in the console as they are fired
 |------------------------------------------
*/
  if (/^(127\.0\.0\.1|localhost|.*\.test)$/.test(router.url().hostname)) {
    broker.withLogs(false); // Enable logs for development
  }

  /**
   * ---------------------------------------------
   * Should the broker require events registration.
   * This ensures that only registered events
   * can be listened to and fire by the broker.
   * ---------------------------------------------
   */
  broker.requireEventsRegistration(true);

  /**
   * ---------------------------------------------
   * Register events with the broker
   * ---------------------------------------------
   */

  broker.registerEvents(appEvents);

  /**
   * ---------------------------------------------
   * Register core services in IoC container
   * ---------------------------------------------
   */
  app().value("appEvents", appEvents);

  /**
   * ---------------------------------------------
   * Node Disposal Callback
   * ---------------------------------------------
   * Use this to clean up external library instances
   * attached to DOM nodes when they are removed.
   */
  registerNodeDisposalCallback((node) => {
    // Example: Dispose Bootstrap tooltips/popovers
    // if (node._bootstrap_tooltip) node._bootstrap_tooltip.dispose();
  });
}

// execute configuration
configureApp();
```

> **Note**: `registerNodeDisposalCallback` is crucial for preventing memory leaks when using third-party libraries that attach instances to DOM elements (like Bootstrap, Tippy.js, etc.). The callback **MUST** be synchronous and stateless.

> **Note**: In the configuration above, we are using `appEvents` imported from `events.js`. We will cover the creation of `events.js` and how to handle events in the subsequent sections.

## 5. Define Application Events

OpenScript uses a centralized event broker. It's best practice to define all your application events in a single file, typically `events.js` (or `src/events.js`).

If you configured `broker.requireEventsRegistration(true)` in your `ojs.config.js`, only events defined here and registered will be allowed.

Create a `src/events.js` file:

```javascript
/**
 * Application Events
 * Structure: Nested object where keys become namespaced event names
 * Example: app.started becomes "app:started"
 *          todo.added -> "todo:added"
 */
export const appEvents = {
  app: {
    started: true,
    ready: true,
  },

  // Example for a Todo App
  todo: {
    added: true,
    deleted: true,
    completed: true,

    // Nested events
    needs: {
      refresh: true,
    },
  },

  ui: {
    modal: {
      opened: true,
      closed: true,
    },
  },
};
```

This structure allows you to use `appEvents.todo.added` to refer to the event in your code, providing strict typing and avoiding magic strings.

## 6. Configure Contexts

Contexts are used to manage state and share data across your application. Create an `ojs.contexts.js` file (or `src/ojs.contexts.js`) to initialize them.

```javascript
import { context, putContext, app } from "modular-openscriptjs";

// 1. Register Context Keys
// This reserves the keys for your contexts.
// The second argument is a provider name (can be arbitrary for simple apps).
putContext(["global", "todo"], "AppContext");

// 2. Export Context Instances for usage in other files
export const gc = context("global");
export const tc = context("todo");

// 3. Setup Function to Initialize States
export function setupContexts() {
  // Initialize Global Context
  gc.states({
    appName: "My OpenScript App",
    isAuthenticated: false,
    user: null,
  });

  // Initialize Todo Context
  tc.states({
    todos: [],
    filter: "all",
  });

  // Add listeners if needed
  tc.todos.listener((state) => {
    console.log("Todos updated:", state.value);
  });

  // 4. Register in IoC Container (Optional but recommended)
  // This allows you to retrieve contexts using app("gc") anywhere.
  app().value("gc", gc);
  app().value("tc", tc);

  console.log("Contexts initialized");
}
```

Don't forget to import and call `setupContexts()` in your `main.js`:

```javascript
// in main.js
import "./ojs.config.js"; // 1. Configuration first
import { setupContexts } from "./ojs.contexts.js"; // 2. Then Contexts

// ... other imports

setupContexts(); // Initialize contexts before mounting app
```

## 7. Configure Routes

Create an `ojs.routes.js` file (or `src/ojs.routes.js`) to define your application's routes.

This file typically handles two things:

1.  Importing your page components.
2.  Defining the routes in the router.
3.  Defining a render helper to mount components into the root element.

```javascript
import { app, ojs } from "modular-openscriptjs";
import App from "./components/App.js"; // Your main layout component
import HomePage from "./components/HomePage.js";

// Register components with the Markup Engine if they aren't auto-discovered
ojs(App, HomePage);

export function setupRoutes() {
  const router = app("router");
  const h = app("h");

  // Get the root element (assuming it was set in Global Context or we get it directly)
  const rootElement = document.getElementById("app-root");

  /**
   * Helper to render a component to the root element.
   * We use h.App (or your layout component) to wrap the page.
   *
   * @param {Component} component - The page component to render.
   */
  const appRender = (component) => {
    // h.App refers to the App component registered above.
    // 'parent' option tells the engine where to render this component.
    return h.App(component, {
      parent: rootElement,
      resetParent: true, // Clear the parent content before rendering
      reconcileParent: true, // Efficiently update the DOM if possible
    });
  };

  // Define Routes

  // Default route (redirects to /home)
  router.default(() => router.to("home"));

  router.on(
    "/",
    () => {
      appRender(h.HomePage());
    },
    "home",
  );

  // Example of another route
  // router.on("/about", () => appRender(h.AboutPage()), "about");

  console.log("Routes configured");
}
```

Now, update your `main.js` to include the routes:

```javascript
// in main.js
import "./ojs.config.js";
import { setupContexts } from "./ojs.contexts.js";
import { setupRoutes } from "./ojs.routes.js"; // Import routes setup

// ...

setupContexts();

// Setup routes before starting the router
setupRoutes();

const router = app("router");
router.listen();
```

You are now set up with the basic structure of an OpenScript application!
