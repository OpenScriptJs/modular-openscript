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

### Vite Configuration

Create `vite.config.js` to enable the OpenScript plugin, which handles tasks like component auto-discovery.

```javascript
import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  plugins: [
    openScriptComponentPlugin({
      // componentsDir: 'src/components' // Optional
    }),
  ],
});
```

### OpenScript Configuration (`ojs.config.js`)

Configure core services like the Router and Broker in a dedicated file.

```javascript
import { app, registerNodeDisposalCallback } from "modular-openscriptjs";
import { appEvents } from "./events.js";

const router = app("router");
const broker = app("broker");

export function configureApp() {
  // Router Config
  router.runtimePrefix("");
  router.basePath("");

  // Broker Config
  broker.CLEAR_LOGS_AFTER = 30000;
  broker.TIME_TO_GC = 10000;
  broker.removeStaleEvents();

  // Enable logs in dev
  if (/^(127\.0\.0\.1|localhost|.*\.test)$/.test(router.url().hostname)) {
    broker.withLogs(true);
  }

  // Strict Event Registration
  broker.requireEventsRegistration(true);
  broker.registerEvents(appEvents);

  // Register appEvents in container for easy access
  app().value("appEvents", appEvents);

  // Cleanup callback for third-party libs
  registerNodeDisposalCallback((node) => {
    // e.g. clean up tooltips
  });
}

configureApp();
```

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
