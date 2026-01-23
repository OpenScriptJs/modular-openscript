# Modular OpenScript Framework

A modern, modular, event-driven JavaScript framework built for scalability and maintainability. OpenScript combines the power of **Inversion of Control (IoC)**, **Reactive State Management**, and a **Component-Based Architecture** into a lightweight package with zero runtime dependencies.

## 🚀 Key Features

- **IoC Container**: Centralized dependency management using a robust container and `app()` helper.
- **Reactive State**: Proxy-based state management with automatic UI updates using `state()`.
- **Event-Driven**: Powerful `Broker` and `Mediator` pattern for decoupled communication.
- **Component-Based**: Class-based components with lifecycle hooks and functional stateless components.
- **OpenScript Markup (OSM)**: A powerful DSL for generating HTML without a Virtual DOM overhead.
- **Fluent Router**: Expressive, fluent API for client-side routing with nested routes and grouping.
- **Context API**: Share state globally without prop drilling.
- **Lightweight**: Zero runtime dependencies, pure JavaScript.
- **Vite Integration**: Optimized build process with automatic component discovery.

---

## 📚 Table of Contents

1. [Installation & Setup](#1-installation--setup)
2. [Core Architecture](#2-core-architecture)
3. [Components](#3-components)
4. [OpenScript Markup (OSM)](#4-openscript-markup-osm)
5. [State Management](#5-state-management)
6. [Context API](#6-context-api)
7. [Events & Broker](#7-events--broker)
8. [Mediators](#8-mediators)
9. [Routing](#9-routing)
10. [IoC Container](#10-ioc-container)
11. [Helper Functions](#11-helper-functions)

---

## 1. Installation & Setup

### Installation

Install the package via npm:

```bash
npm install modular-openscriptjs
```

### Project Structure (Entry Point)

1. **index.html**: Create your app shell.

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

2. **src/main.js**: Initialize the app.

```javascript
import "./ojs.config.js"; // Import config first
import { app } from "modular-openscriptjs";
import { setupRoutes } from "./routes.js";
import { setupContexts } from "./contexts.js";

async function init() {
  setupContexts(); // Initialize global state

  const rootElement = document.getElementById("app-root");
  setupRoutes(rootElement); // Configure routes

  // Start the router
  app("router").listen();
}

init();
```

_Note: In visual applications, you typically define routes that render components into the `rootElement`._

### Vite Configuration

Create `vite.config.js` to enable the OpenScript plugin, which handles tasks like component auto-discovery.

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

### OpenScript Configuration (`ojs.config.js`)

Create an `ojs.config.js` file in your project root. This file is where you configure the core services of OpenScript, such as the Router and Broker.

```javascript
import { app, registerNodeDisposalCallback } from "modular-openscriptjs";
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
    // if bootstrap.Tooltip.getInstance(node) {
    //   bootstrap.Tooltip.getInstance(node).dispose();
    // }
  });
}

// execute configuration
configureApp();
```

> **Note**: `registerNodeDisposalCallback` is crucial for preventing memory leaks when using third-party libraries that attach instances to DOM elements (like Bootstrap, Tippy.js, etc.). The callback **MUST** be synchronous and stateless.

> **Note**: In the configuration above, we are using `appEvents` imported from `events.js`. We will cover the creation of `events.js` and how to handle events in the subsequent sections.

### Define Application Events

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

### Configure Contexts

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

### Configure Routes

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

---

## 2. Core Architecture

OpenScript is built around an **Inversion of Control (IoC) Container**. Instead of importing global instances directly, you access core services via the `app()` helper.

| Service           | Access                   | Description                                    |
| :---------------- | :----------------------- | :--------------------------------------------- |
| **Markup Engine** | `app('h')`               | Helper proxy for creating DOM elements.        |
| **Router**        | `app('router')`          | Manages navigation and URL handling.           |
| **Broker**        | `app('broker')`          | Central event bus for decoupled communication. |
| **Context**       | `app('contextProvider')` | Manages global application state contexts.     |

---

## 3. Components

Components are the building blocks of your UI.

### Class Components

Extend `Component` for stateful logic and lifecycle hooks.

```javascript
import { Component, app, ojs, state } from "modular-openscriptjs";

const h = app("h");

export default class Counter extends Component {
  constructor() {
    super();
    this.count = state(0);
  }

  render() {
    return h.div(
      h.h1(`Count: ${this.count.value}`),
      h.button({ onclick: () => this.count.value++ }, "Increment"),
    );
  }
}

// CRITICAL: Register before usage!
ojs(Counter);
```

> [!IMPORTANT]
> **Registration Required**: You **MUST** call `ojs(YourComponent)` to register the component in the IoC container. This allows the framework to instantiate it and manage its lifecycle.

### Functional Components

Simple functions for stateless UI.

```javascript
export default function Card({ title, content }) {
  return h.div({ class: "card" }, h.h2(title), h.p(content));
}
```

### Event Listening

Use the `listeners` object for safe event binding.

```javascript
h.button(
  {
    class: "btn",
    listeners: {
      click: (e) => console.log("Clicked!"),
      mouseover: () => console.log("Hovered"),
    },
  },
  "Click Me",
);
```

#### Special Lifecycle Methods

- `$_mounted(componentId)`: Component added to DOM.
- `$_rendered(componentId)`: Component rendered.

> **Note**: Use `component(componentId)` inside these methods to get a safe reference to the instance if `this` is not bound correctly.

---

## 4. OpenScript Markup (OSM)

OSM is a DSL for generating HTML using the `h` proxy.

### Basic Usage

```javascript
const h = app("h");

h.div({ id: "main", class: "container" }, h.h1("Title"), h.p("Paragraph text"));
```

### Attributes

Pass attributes as objects. Multiple objects are merged. Class strings are concatenated.

```javascript
h.div({ class: "btn" }, "Text", { class: "btn-primary", "data-id": 1 });
// <div class="btn btn-primary" data-id="1">Text</div>
```

### Special Attributes

- **`parent`**: Append directly to a DOM node.
- **`resetParent`**: Clear parent before appending.
- **`replaceParent`**: Replace the parent node.
- **`listeners`**: Safe event listeners object.
- **`c_attr` / `$`-prefix**: Pass attributes to the component wrapper (e.g., `$class: "wrapper-class"`).

### Fragments

Use `h.$()` or `h._()` to group elements without a wrapper.

```javascript
h.$(h.li("Item 1"), h.li("Item 2"));
```

> **Warning**: Fragments cannot be reactive roots for components.

---

## 5. State Management

OpenScript uses `State` objects. When a state's `.value` changes, bound UI updates automatically.

### creating State

```javascript
import { state } from "modular-openscriptjs";

const count = state(0);
const user = state({ name: "Guest" });
```

### Using in Components

1. **Auto-Listen**: Pass state to `render()`.
   ```javascript
   render(count) { return h.div(count.value); }
   ```
2. **Anonymous Component (`v`)**: Update specific parts of the DOM.

   ```javascript
   import { v } from "modular-openscriptjs";

   h.div(
     "Static content ",
     v(count, (c) => `Dynamic: ${c.value}`),
   );
   ```

---

## 6. Context API

Share state globally across components and mediators.

### Setup

```javascript
// contexts.js
import { putContext, context, app } from "modular-openscriptjs";

// 1. Define
putContext("global", "GlobalContext");

// 2. Export
export const gc = context("global");

// 3. Initialize
export function setupContexts() {
  gc.states({
    theme: "dark",
    currentUser: null,
  });

  app().value("gc", gc);
}
```

### Usage

```javascript
import { gc } from "./contexts.js";

// Read/Write
gc.theme.value = "light";

// In Component
render() {
  return h.div(`Theme is: ${gc.theme.value}`);
}
```

---

## 7. Events & Broker

The **Broker** manages application-wide events.

### Defining Events (`events.js`)

Define events as a "fact" structure.

```javascript
export const appEvents = {
  auth: {
    login: true, // "auth:login"
    logout: true, // "auth:logout"
  },
  user: {
    updated: true, // "user:updated"
  },
};
```

### Registration

In `ojs.config.js`:

```javascript
broker.registerEvents(appEvents);
```

### Payloads

Use `payload()` to create standardized event messages.

```javascript
import { payload } from "modular-openscriptjs";

broker.send(appEvents.auth.login, payload({ userId: 123 }, { source: "ui" }));
```

---

## 8. Mediators

Mediators bridge UI and Logic. They are stateless classes that listen to Broker events.

```javascript
// AuthMediator.js
import { Mediator } from "modular-openscriptjs";
import { EventData } from "modular-openscriptjs";

export default class AuthMediator extends Mediator {
  shouldRegister() { return true; }

  // Listen to 'auth:login'
  async $$auth_login(eventData, event) {
    const data = EventData.parse(eventData); // Parse payload
    console.log("User logged in:", data.message);

    this.send("user:updated", payload({ ... }));
  }
}
```

### Registration (`boot.js` Pattern)

It is best practice to register all mediators in a `boot.js` file.

```javascript
// boot.js
import { ojs } from "modular-openscriptjs";
import AuthMediator from "./mediators/AuthMediator";

export default function boot() {
  ojs(AuthMediator);
}
```

---

## 9. Routing

The Router uses a fluent API.

```javascript
const router = app("router");
const h = app("h");

// Basic Route
router.on("/", () => {
    h.HomePage({ parent: document.body, resetParent: true });
}, "home");

// Route with Params
router.on("/user/{id}", () => {
    const id = router.params.id;
    // render user profile...
}, "user.profile");

// Groups
router.prefix("/admin").group(() => {
    router.on("/dashboard", ...);
    router.on("/settings", ...);
});

// Navigation
router.to("user.profile", { id: 42 });

// Default/404
router.default(() => router.to("home"));
```

---

## 10. IoC Container

Manage dependencies via `app()`.

### Accessing Services

```javascript
const router = app("router");
const container = app();
```

### Registering Services

```javascript
// Singleton (Single instance)
app().singleton("api", ApiService);

// Transient (New instance every time)
app().transient("logger", Logger);

// Value (Constant/Instance)
app().value("config", { apiUrl: "..." });
```

### Dependency Injection

```javascript
class UserService {
  constructor(api) {
    this.api = api;
  }
}

// Inject 'api' service into UserService
app().singleton("userService", UserService, ["api"]);
```

---

## 11. Helper Functions

Global utilities available in `window` or via import.

- **`ifElse(condition, trueVal, falseVal)`**: Logic helper.
- **`coalesce(v1, v2)`**: Null coalescing.
- **`each(list, cb)`**: Safe iteration.
- **`dom.id(id)` / `dom.get(sel)`**: DOM query shortcuts.
- **`component(id)`**: Get component instance by ID.
