# OpenScriptJs

<p align="center">
  <a href="https://github.com/OpenScriptJs/modular-openscript" target="_blank">
    <!-- You can add a logo here if available -->
    <img src="https://via.placeholder.com/200x50?text=OpenScriptJs" alt="OpenScriptJs Logo" width="200">
  </a>
</p>

<p align="center">
    <strong>The Progressive, PHP-Inspired JavaScript Framework for Artisans.</strong>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/modular-openscriptjs"><img src="https://img.shields.io/npm/v/modular-openscriptjs.svg?style=flat-square" alt="NPM Version"></a>
    <a href="https://github.com/OpenScriptJs/modular-openscript/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/modular-openscriptjs.svg?style=flat-square" alt="License"></a>
    <a href="https://github.com/OpenScriptJs/modular-openscript/issues"><img src="https://img.shields.io/github/issues/OpenScriptJs/modular-openscript?style=flat-square" alt="Issues"></a>
</p>

## Introduction

OpenScriptJs is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable, creative experience to be truly fulfilling. OpenScript attempts to take the pain out of development by easing common tasks used in the majority of web projects, such as simple routing, powerful state management, and decoupled event handling.

It combines the best concepts from sophisticated backend architectures—like **Inversion of Control (IoC)** and **Mediator Patterns**—with the modern reactivity of frontend development. The result is a lightweight, zero-dependency framework that scales from small widgets to complex Single Page Applications without the bloat.

## 🚀 Why OpenScriptJs?

We didn't just build another framework; we built a toolset for developers who value structure and clarity.

- **IoC Container**:  
  _Why?_ Managing dependencies manually is messy. Our robust container and `app()` helper give you a centralized way to manage your services, promoting loose coupling and testability.

- **Reactive State**:  
  _Why?_ UI should be a function of state. Our proxy-based `state()` system automatically updates your DOM when data changes, without the complexity of a Virtual DOM.

- **Event-Driven Architecture**:  
  _Why?_ Components shouldn't talk directly to each other; it leads to spaghetti code. Our powerful `Broker` and `Mediator` pattern enables true decoupling.

- **Component-Based**:  
  _Why?_ Reusability is key. Build encapsulated functional or class-based components with full lifecycle hooks.

- **OpenScript Markup (OSM)**:  
  _Why?_ Context switching between HTML and JS breaks flow. OSM allows you to generate HTML using expressive JavaScript, giving you the full power of the language right in your views.

- **Fluent Router & Context API**:  
  _Why?_ Modern apps need robust navigation and global state sharing without "prop drilling". We provide both out of the box.

- **Zero Dependencies**:  
  _Why?_ Bloat slows you down. OpenScriptJs is pure, lightweight JavaScript.

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

Class components extend `Component` and provide state management, lifecycle hooks, and event handling.

```javascript
import { Component, app, ojs, state } from "modular-openscriptjs";

const h = app("h");

export default class Counter extends Component {
  constructor() {
    super();
    this.count = state(0);
  }

  // Lifecycle Methods (prefixed with $_)
  // CRITICAL: Always use component(id) to get the instance safely.
  $_mounted(id) {
    console.log(`Counter ${id} mounted`);
  }

  increment() {
    this.count.value++;
  }

  render(...args) {
    return h.div(
      h.h1(`Count: ${this.count.value}`),
      h.button({ onclick: this.method("increment") }, "Increment"),
      ...args,
    );
  }
}

// CRITICAL: Register before usage!
ojs(Counter);
```

> [!IMPORTANT]
> **Registration Required**: You **MUST** call `ojs(YourComponent)` to register the component in the IoC container. This allows the framework to instantiate it and manage its lifecycle.

### Functional Components

Simple functions for stateless UI. They receive `props` (arguments) and return markup.

```javascript
export default function Card(title, content, ...args) {
  return h.div({ class: "card" }, h.h2(title), h.p(content), ...args);
}
```

### 💡 Choosing the Right Component Type

- **Use Functional Components** when your component is just receiving data and displaying it. They are lighter, faster, and easier to test.
- **Use Class Components** when you need:
  - Internal state (toggle buttons, form inputs).
  - Lifecycle hooks (`$_mounted` for API calls or setting up 3rd party libs).
  - Complex event handlers.

### Naming Conventions

- **Classes/Functions**: PascalCase (e.g., `UserProfile`).
- **Files**: PascalCase (e.g., `UserProfile.js`).
- **Tags**: Kebab-case (automatically derived, e.g., `<ojs-user-profile>`).

### Event Listening

There are multiple ways to listen to events in a component.

#### 1. DOM Events (`listeners`)

Use the `listeners` object in attributes for safe binding. This is the **preferred** method.

```javascript
h.button(
  {
    listeners: {
      // Use anonymous functions for safety
      click: (e) => this.increment(),
    },
  },
  "Click Me",
);
```

#### 2. Lifecycle Events (`$_`)

Methods prefixed with `$_` hook into the component's lifecycle and internal events.

- **`$_mounted(componentId)`**: Called when the component is added to the DOM.
- **`$_rendered(componentId)`**: Called after the component renders.

> [!WARNING]
> **Context Safety**: Inside `$_` methods, **do not rely on `this`** directly. The context might not be bound as expected.
> Instead, use the `component(id)` helper:
>
> ```javascript
> import { component } from "modular-openscriptjs";
>
> $_mounted(id) {
>    const self = component(id); // Safe instance access
>    self.initData();
> }
> ```

#### 3. Broker Events (`$$`)

Listen to global application events dispatched via the Broker. Methods prefixed with `$$` are automatically registered as listeners.

**Signature**: `(eventData, eventName)`

- `eventData`: The JSON stringified payload (must be parsed).
- `eventName`: The specific event name triggered.

```javascript
import { parsePayload } from "modular-openscriptjs";

export default class UserProfile extends Component {
  // Listen for 'auth:login' event
  async $$auth_login(eventData, eventName) {
    // 1. Parse the payload
    const data = parsePayload(eventData);

    console.log("User Logged In:", data.message.get("userId"));
  }
}
```

#### 4. Inline Attribute Listeners

For attributes that expect a string script (like `onclick`), use `this.method()`.

```javascript
h.button({ onclick: this.method("handleClick") }, "Click");
```

---

## 4. OpenScript Markup (OSM)

OpenScript Markup (OSM) is a powerful, JavaScript-based Domain Specific Language (DSL) for generating HTML. At its core is the `h` proxy service, which translates property accessors into DOM elements.

### 💡 Why OSM?

You might ask, "Why not just use HTML or JSX?"

While JSX is popular, it requires a build step. **OSM is pure JavaScript.**

- **No Compilation Required**: It works directly in the browser.
- **Full Power of JS**: You can use `map`, `filter`, variables, and functions directly within your structure without context switching.
- **Composition**: Functions can return arrays of elements, making composition trivial.

### Basic Usage

You access OSM via the `h` service from the IoC container.

```javascript
import { app } from "modular-openscriptjs";

const h = app("h");

// Simple element
// The proxy intercepts 'div' and creates a <div> element
const myDiv = h.div({ id: "main" }, "Hello World");
```

### Attributes & Properties

Attributes are passed as properties in an object argument. Flexible placement of arguments allows you to pass attributes anywhere in the function call.

```javascript
// Attributes can be first, middle, or last
h.div("Text Content", { class: "text-lg" }, h.span("Child"));
```

#### Class Merging

OSM intelligently handles the `class` attribute. If you pass multiple objects containing `class`, they are **concatenated** rather than overwritten. This is incredibly useful for conditional styling.

```javascript
h.button({ class: "btn" }, "Click Me", { class: "btn-primary" });
// Result: <button class="btn btn-primary">Click Me</button>
```

#### Event Handling (`listeners`)

> [!WARNING]
> **Memory Safety**: Do not use standard `addEventListener` on nodes created by OpenScript, as it can lead to memory leaks when components are unmounted.

Instead, usage the `listeners` object attribute. The framework tracks these listeners and automatically removes them during the component disposal phase.

```javascript
h.button(
  {
    listeners: {
      click: (e) => console.log("Clicked!", e),
      mouseover: (e) => console.log("Hovered", e),
    },
  },
  "Safe Button",
);
```

#### Extended Functionality (`methods`)

You can attach custom methods directly to a DOM node using the `methods` attribute. This is useful for exposing API-like functionality on specific elements.

```javascript
h.div({
  id: "my-widget",
  methods: {
    refresh: function () {
      this.innerHTML = "Refreshed!";
    },
  },
});

// Later usage:
document.getElementById("my-widget").methods().refresh();
```

#### Inline String Handlers (`h.func`)

For attributes that require a string function call (like `onclick` or `onchange`), use `h.func` to format the call correctly with arguments.

```javascript
h.button(
  {
    onclick: h.func("myGlobalHandler", 123, "test"),
  },
  "Click Me",
);
// Renders: onclick="myGlobalHandler(123, 'test')"
```

### Logic Helpers

OSM provides built-in helpers to handle logic directly within your markup structure.

#### `h.call(callback)`

Execute arbitrary logic during the render process. The callback should return a valid Node, string, or array.

```javascript
h.div(
  h.call(() => {
    const date = new Date();
    return h.span(`Rendered at: ${date.toLocaleTimeString()}`);
  }),
);
```

#### Iteration (`each`)

Iterate over arrays or objects efficiently.

```javascript
import { each } from "modular-openscriptjs";

const items = ["Apple", "Banana"];

h.ul(each(items, (item, index) => h.li(item)));
```

#### Conditionals (`ifElse`)

Render content based on boolean conditions.

```javascript
import { ifElse } from "modular-openscriptjs";

h.div(ifElse(isLoggedIn, h.button("Logout"), h.button("Login")));
```

### Fragments (`h.$` / `h._`)

Fragments allow you to group multiple elements without adding an extra node to the DOM.

```javascript
h.$(h.li("Item 1"), h.li("Item 2"));
```

> [!IMPORTANT]
> **Single Root Requirement**: Even when using fragments, your overall component structure or logic block must eventually anchor to a single parent element in the DOM tree.
> **No Wrapper**: Components returning a fragment are **NOT** wrapped in a custom element (e.g., `<ojs-my-comp>`). This means they cannot easily hold local state or use lifecycle hooks that depend on the wrapper. Use fragments primarily for static content or splitting up render logic.

### Special Attributes

OpenScript reserves specific attributes to control rendering behavior and component wrapping.

#### Render Placement

Control where an element is injected relative to a target parent.

| Attribute       | Description                                      |
| :-------------- | :----------------------------------------------- |
| `parent`        | The DOM node to append to.                       |
| `resetParent`   | If `true`, clears the `parent` before appending. |
| `replaceParent` | If `true`, replaces the `parent` node entirely.  |
| `firstOfParent` | Prepend to the `parent` instead of appending.    |

```javascript
// Example: Render a modal directly into the body
h.div(
  {
    parent: document.body,
    class: "modal-overlay",
  },
  h.Card("Modal Content"),
);
```

#### Component Wrapper (`c_attr` / `$`)

Pass attributes to a Component's custom element wrapper.

- **`c_attr`**: An object containing attributes for the wrapper.
- **`$` prefix**: Shorthand for wrapper attributes (e.g., `$class`, `$id`).

```javascript
// Renders: <ojs-user-profile class="theme-dark" id="profile-1"></ojs-user-profile>
h.UserProfile({
  $class: "theme-dark",
  $id: "profile-1",
});
```

---

## 5. State Management

OpenScript uses the `State` class to handle reactive data. When a state's value changes, any dependent components or listeners are automatically notified, triggering UI updates.

### ⚡ The Magic of Proxies

OpenScript leverages modern JavaScript **Proxies**. This means you don't need special setter functions like `setState({ count: 1 })` found in other frameworks. You simply assign the value, and the framework handles the rest.

- **Clean Syntax**: `count.value = 5`. That's it.
- **Micro-Updates**: Only the specific nodes bound to that state update in the DOM. The entire component doesn't necessarily re-render, making it incredibly performant.

### Creating State

You create a state object using the `state` helper function. States can hold primitives(strings, numbers, booleans) or objects.

```javascript
import { state } from "modular-openscriptjs";

// Primitive State
const count = state(0);
const theme = state("dark");

// Object State
const user = state({
  id: 1,
  name: "Levi",
  preferences: { notifications: true },
});
```

### Using State in Components

#### 1. Automatic Listening (Render Argument)

The most common pattern is to pass the state object directly to a component's `render` method. The component automatically subscribes to the state and re-renders whenever its value changes.

```javascript
export default class CounterDisplay extends Component {
  render(countState, ...args) {
    // This component automatically re-renders when countState.value changes
    return h.div(
      h.span("Current Count: "),
      h.strong(countState.value),
      ...args,
    );
  }
}

// Usage
h.CounterDisplay(count);
```

#### 2. Anonymous Components (`v` helper)

For fine-grained updates without creating a full class component, use the `v` (value) helper. It creates a lightweight anonymous component that listens to the state. This is highly efficient for updating text nodes or attributes.

```javascript
import { v, app } from "modular-openscriptjs";
const h = app("h");

h.div(
  h.h1("Welcome"),
  // Only this specific text node updates when 'user' state changes
  v(user, (u) => `Hello, ${u.name}!`),
);
```

### Reactivity & Objects

> [!CAUTION]
> **Object Property Pitfall**: Modifying a property of an object stored in state **does NOT** trigger the state to fire. The state system watches the reference of the value, not the deep properties.

```javascript
// ❌ THIS WILL NOT WORK
user.value.name = "John"; // The UI will not update!

// ✅ THIS WORKS (Clone & Set)
// You must create a new object reference to trigger the state system.
user.value = { ...user.value, name: "John" };

// OR for deep clones/resets
const newUser = JSON.parse(JSON.stringify(user.value));
newUser.name = "John";
user.value = newUser; // Triggers update
```

**Rule of Thumb**: Treat state values as immutable. Always replace the object entirely when you want to trigger an update.

### State Helper Methods

The `State` object provides several methods for manual control:

- **`.value`**: Getter/Setter for the current value. Setting this triggers listeners.
- **`.fire()`**: Manually triggers all listeners without changing the value. Useful if you've mutated an object in place (though not recommended) and need to force a refresh.
- **`.listener(callback)`**: Manually subscribe to changes.

```javascript
// Manual subscription
count.listener((s) => {
  console.log("Count changed to:", s.value);
});
```

### Global vs Local State

- **Local State**: Defined inside a component's constructor (`this.count = state(0)`). Used for component-specific logic (toggles, form inputs).
- **Global State**: Defined in a shared file (e.g., `contexts.js` or `store.js`) and imported by multiple components. Used for app-wide data (user profile, theme, cart).

---

## 6. Context API

The Context API provides a mechanism to share state and data across decoupled components and mediators without the need for "prop drilling" (passing data through multiple layers of components). It acts as a shared, central repository for specific domains of your application.

### 💼 Common Use Cases

Use Context for data that is truly global:

- **User Session**: Is the user logged in? Who are they?
- **Theme Settings**: Dark mode vs Light mode.
- **Language/Localization**: Current active language.
- **Shopping Cart**: Items currently in the cart.

For everything else (form inputs, toggle states), stick to local Component State to keep your app simple.

### Setup & Definition

Defining a context is simple. You register it using `putContext` (usually in a dedicated `contexts.js` file) and then export an accessor for it.

```javascript
// src/contexts.js
import { putContext, context, app } from "modular-openscriptjs";

// 1. Register Context Keys
// The first argument is the key used to retrieve it later.
// The second argument is a label (useful for debugging).
putContext("global", "GlobalContext");
putContext("user", "UserContext");

// 2. Export Helper Accessors
// This allows other files to simply import 'gc' or 'uc' to access the context.
export const gc = context("global");
export const uc = context("user");

// 3. Initialize States
export function setupContexts() {
  // Bulk initialize states for the global context
  gc.states({
    theme: "dark",
    appName: "OpenScript App",
    isLoading: false,
  });

  // Initialize user context
  uc.states({
    profile: null,
    isAuthenticated: false,
  });

  // Optional: Register in IoC container for dependency injection
  app().value("gc", gc);
  app().value("uc", uc);
}
```

### Usage

Once defined, you can import and use the context anywhere in your application—in Components, Mediators, or plain JavaScript services.

```javascript
import { gc, uc } from "./contexts.js";

// Reading State
console.log("Current Theme:", gc.appState.theme.value);

// Writing State
// This will trigger updates in any component listening to 'theme'
gc.appState.theme.value = "light";

// Using in a Component
export default class Header extends Component {
  render() {
    return h.header(
      h.h1(gc.appState.appName.value),
      // Bind directly to state for automatic updates
      v(uc.appState.isAuthenticated, (auth) =>
        auth ? h.button("Logout") : h.button("Login"),
      ),
    );
  }
}
```

### Best Practices

#### Global vs. Local State

- **Use Context** for data that needs to be accessed by many completely different parts of your application (e.g., User Session, Theme, Shopping Cart, Notifications).
- **Use Component State** for transient UI data that only matters to that specific component or its immediate children (e.g., whether a modal is open, current input value of a form field).

#### Performance Warning: Large Lists

> [!WARNING]
> **Large Datasets**: Do not store massive arrays (e.g., 1000+ items for an infinite scroll) directly in a reactive Context State if they are strictly for display.

Making a huge array reactive can have performance costs. Instead:

1.  **Mediators** should handle fetching the data.
2.  Store the raw data in a non-reactive service or cache.
3.  **Components** should retrieve only the slice of data they need to render.
4.  Use `replaceParent` or manual DOM appending for infinite lists to avoid re-rendering the entire list on every small update.

---

## 7. Events & Broker

In a large application, you don't want every part of your code to know about every other part. That's "tight coupling," and it leads to spaghetti code.

The **Broker** solves this. Think of it like a community bulletin board or a chat room.

1.  **Publisher**: One part of the app (e.g., a "Login Button") posts a message ("User just logged in!").
2.  **Subscriber**: Other parts (e.g., the "Profile Header" or "Analytics Tracker") act on that message.
3.  **Decoupling**: The Login Button doesn't know who is listening. It just posts the message and moves on.

### 1. Defining Events (`events.js`)

To prevent typos (like typing `"auth:logni"` instead of `"auth:login"`), we define all our event names in a central file. OpenScript uses a special "fact" object structure.

```javascript
// src/events.js
// We use nested objects set to 'true'.
// OpenScript will convert these into string keys for us.
export const appEvents = {
  auth: {
    login: true, // Becomes "auth:login"
    logout: true, // Becomes "auth:logout"
    error: true, // Becomes "auth:error"
  },
  cart: {
    added: true, // Becomes "cart:added"
    removed: true, // Becomes "cart:removed"
    checkout: {
      success: true, // Becomes "cart:checkout:success"
    },
  },
};
```

### 2. Registration

For the system to understand these events, you must register them in your configuration file.

```javascript
// ojs.config.js
import { appEvents } from "./src/events.js";

// Registering validates the structure and enables the system to use them.
broker.registerEvents(appEvents);
```

### 3. Sending Events with Payloads

When an event happens, you often need to send data with it (e.g., _which_ user logged in?).
OpenScript uses a standardized **Payload** format to keep things organized. A payload has two parts:

- **Message**: The actual data (User ID, Cart Item, etc.).
- **Meta**: Extra info (Timestamp, Source, ID).

Use the `payload` helper to create this package.

```javascript
import { payload } from "modular-openscriptjs";

// Inside your Login Logic...
const userData = { id: 42, name: "Alice" };

// Send the event
// 'this.send' is available in Mediators.
// Anywhere else, you can use broker.send(name, payload)
broker.send(appEvents.auth.login, payload(userData, { timestamp: Date.now() }));
```

### 4. Listening & Parsing Payloads

When you listen for an event (e.g., in a Mediator or Component), you receive the payload as a **JSON string**. You typically need to **parse** it to use the helper methods.

**Why a string?** It ensures that data remains immutable during transit and can be easily serialized for logging or debugging.

```javascript
import { parsePayload } from "modular-openscriptjs";

// In a Component or Mediator
async $$auth_login(eventData, eventName) {
    // 1. Parse the string back into an EventData object
    const data = parsePayload(eventData);

    // 2. Access the message
    const userId = data.message.get("id"); // 42
    const userName = data.message.get("name"); // "Alice"

    console.log(`User ${userName} logged in!`);
}
```

#### EventData Helper Methods

Once parsed, the `data` object gives you safe ways to access info:

- `data.message.get("key")`: Get a value.
- `data.message.has("key")`: Check if a value exists.
- `data.message.getAll()`: Get the raw object `{ id: 42, name: "Alice" }`.
- `data.meta.get("timestamp")`: Access metadata.

---

## 8. Mediators

Mediators are the **"Logic Handlers"** of your application.

### 🧠 Philosophy: Separation of Concerns

In many frameworks, business logic often bleeds into UI components, making them hard to read and impossible to test. OpenScript enforces a strict separation:

- **Components**: Responsible ONLY for rendering and user interaction.
- **Mediators**: Responsible for API calls, data manipulation, and business rules.

#### The Restaurant Analogy

Think of your application like a busy restaurant:

- **Component (Waiter)**: Takes the order (Button Click) and sends it to the kitchen. It doesn't cook anything; it just shouting "Order Up!".
- **Mediator (Chef)**: Listens for the order, cooks the food (API Call), and rings the bell when done.
- **Broker (Counter)**: The central communication hub where orders are placed and picked up.

### 1. Creating a Mediator

A Mediator is just a class that extends `Mediator`. It doesn't have a UI. It just listens for events and does work.

```javascript
// src/mediators/AuthMediator.js
import { Mediator, parsePayload, payload } from "modular-openscriptjs";

export default class AuthMediator extends Mediator {
  // REQUIRED: This tells the framework to scan this class for listeners
  shouldRegister() {
    return true;
  }

  // Logic: Listen for 'auth' and 'login' events
  async $$auth_login(eventData, eventName) {
    const data = parsePayload(eventData);
    const credentials = data.message.getAll();

    try {
      // "Cook the food" (Perform Logic)
      const user = await fakeApiService.login(credentials);

      // "Serve the food" (Emit Result)
      this.send("auth:success", payload({ user }));
    } catch (err) {
      this.send("auth:error", payload({ error: err.message }));
    }
  }
}
```

### 2. Registration (`boot.js` Pattern)

Just creating a file doesn't make it work. You need to tell OpenScript to "turn on" these mediators. The best way to do this is a dedicated `boot.js` file.

**Step A: Create `src/boot.js`**
Use the `ojs()` helper to register your mediators.

```javascript
// src/boot.js
import { ojs } from "modular-openscriptjs";
import AuthMediator from "./mediators/AuthMediator";
import CartMediator from "./mediators/CartMediator";

export default function bootMediators() {
  // This instantiates the mediators and connects their listeners
  ojs(AuthMediator, CartMediator);
}
```

**Step B: Import in `main.js`**
Call the boot function when your app starts.

```javascript
// src/main.js
import bootMediators from "./boot";

// ... other setup ...

bootMediators(); // 🚀 Logic layer is now active!
```

### 3. Event Listening Tricks

The `$$` syntax is powerful. You can listen to single events, multiple events, or entire namespaces.

#### The "OR" Operator (`_`)

If you put an underscore in the method name, it acts like an "OR".

```javascript
// Listens for 'user' OR 'login' (Not 'user:login')
$$user_login(data, event) {
    console.log(`Triggered by ${event}`);
}
```

#### Namespaces (Nested Objects)

To organize listeners for related events (like `auth:login`, `auth:logout`), use a nested object.

```javascript
/*
 * This property name '$$auth' matches the 'auth' namespace.
 * Inside, keys match the sub-events.
 */
$$auth = {
  // Listens for 'auth:login'
  login: async (data) => {
    /* handle login */
  },

  // Listens for 'auth:logout'
  logout: async (data) => {
    /* handle logout */
  },

  // Deep nesting works too: 'auth:password:reset'
  password: {
    reset: (data) => {
      /* ... */
    },
  },
};
```

### 4. Best Practices

- **Keep Components Stupid**: Your components should just show data and emit events. Move ALL complex logic to Mediators.
- **Stateless logic**: Mediators generally shouldn't hold a "state". They should act on the payload they receive. If you need to store data, update a Global Context or State.

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

Single Page Applications (SPAs) don't reload the page when you click a link. Instead, they just swap out the content on the screen. The **Router** handles this job.

### 1. Basic Setup

First, let's get the router instance from the container.

```javascript
import { app, dom } from "modular-openscriptjs";

const router = app("router");
const h = app("h");

// Define a standardized way to swap content.
// We select a root element and say "Everything inside here belongs to the current route".
const mountPoint = dom.id("app-root");

function appRender(component) {
  h.App(component, {
    parent: mountPoint,
    resetParent: route.reset, // Clear previous page
    reconcileParent: true, // Smart DOM Diffing (Smoother)
  });
}
```

### 2. Defining Routes

We use `.on(path, callback, name)` to strict define a route.

- **Path**: The URL pattern.
- **Callback**: What happens when we visit that URL (usually calling our `appRender` function).
- **Name**: A nickname for the route (e.g., 'home'), so we don't have to hardcode URLs later.

```javascript
// A method chain is the cleanest way
router
  .on("/", () => appRender(h.HomePage()), "home")
  .on("/about", () => appRender(h.AboutPage()), "about")
  .on("/contact", () => appRender(h.ContactPage()), "contact");
```

#### Multiple Paths (`orOn`)

Sometimes two URLs should go to the same place (e.g., `/login` and `/signin`).

```javascript
router.orOn(["/login", "/signin"], () => appRender(h.LoginPage()));
```

### 3. Route Parameters

What if we want to show a profile for _any_ user? We use **curly braces** `{}` to make a segment dynamic.

```javascript
// Matches /user/1, /user/42, /user/abc
router.on(
  "/user/{id}",
  () => {
    // 1. Get the parameter
    const userId = router.params.id;

    // 2. Render component with that ID
    appRender(h.UserProfile({ id: userId }));
  },
  "user.profile",
);
```

### 4. Grouping Routes (`prefix`)

If you have an Admin section, you don't want to type `/admin/dashboard`, `/admin/users`, etc., over and over.

```javascript
router.prefix("/admin").group(() => {
  // URL: /admin/dashboard
  router.on("/dashboard", () => appRender(h.Dashboard()), "admin.dash");

  // URL: /admin/settings
  router.on("/settings", () => appRender(h.Settings()), "admin.settings");
});
```

### 5. Navigation & Logic

Instead of `<a href="/about">`, we use the router to navigate programmatically.

```javascript
// Go to a URL
router.to("/about");

// Go to a Named Route (Better practice!)
// This generates the URL for you. If you change the URL structure later, this code doesn't break.
router.to("user.profile", { id: 42 }); // Goes to /user/42

// Check where we are (Useful for highlighting menu items)
if (router.is("home")) {
  console.log("We are home!");
}
```

### 6. The 404 Page (Default)

If the user types a garbage URL, show them a nice error page.

```javascript
router.default(() => {
  appRender(h.NotFoundPage());
});
```

---

## 10. IoC Container

As your app grows, managing connections between everything (Routers, APIs, Settings) becomes messy. The **IoC (Inversion of Control) Container** solves this by acting as a "central warehouse" for all your services.

### 🏭 Why Inversion of Control?

Directly importing dependencies (e.g., `import api from './api'`) creates rigid, hard-to-test code.
The IoC container allows you to swap implementations easily. This is excellent for testing: you can inject a "Fake API" when running unit tests without changing a single line of your component code.

Instead of writing `new ApiService()` everywhere, you simply ask the container: _"Hey, give me the API Service"_ and it hands it to you.

### 1. The `app()` Helper

The `app()` function is your key to the warehouse.

```javascript
import { app } from "modular-openscriptjs";

// 1. Get a Service
const router = app("router");
const broker = app("broker");

// 2. Get the Container itself (to register things)
const container = app();
```

### 2. Registering Services

You typically do this in `ojs.config.js` or a `boot.js` file.

#### A. Values (Config/Constants)

Great for API keys or simple objects.

```javascript
app().value("config", {
  apiKey: "xyz-123",
  theme: "dark",
});
```

#### B. Singletons (One Instance Forever)

The container creates the object **once** (the first time you ask for it) and then reuses it. Perfect for stateful services like a `Router` or `AuthService`.

```javascript
import AuthService from "./services/AuthService";

// Register
app().singleton("auth", AuthService);

// Usage
const auth1 = app("auth"); // Creates new instance
const auth2 = app("auth"); // Returns SAME instance
```

#### C. Transients (New Instance Every Time)

The container creates a **fresh** object every time you ask. Good for things like loggers or HTTP requests.

```javascript
app().transient("logger", Logger);
```

### 3. Dependency Injection (Magic!)

Here is the superpower. If your `UserService` needs the `AuthService` and `Broker` to work, you don't have to pass them manually. The container does it for you.

```javascript
class UserService {
  // The container will pass these arguments to the constructor
  constructor(auth, broker) {
    this.auth = auth;
    this.broker = broker;
  }

  deleteAccount() {
    this.auth.currentUser.delete();
    this.broker.send("user:deleted");
  }
}

// Registering: Define the array of dependency names ["auth", "broker"]
app().singleton("user", UserService, ["auth", "broker"]);

// Usage: Just ask for 'user', and the rest is automatic!
const userService = app("user");
```

### 4. Core Services

OpenScript comes with these built-in services ready to use:

| Service Name        | Description                    |
| :------------------ | :----------------------------- |
| `"h"`               | The Markup Engine (HTML Proxy) |
| `"router"`          | The Navigation Router          |
| `"broker"`          | The Event Broker               |
| `"contextProvider"` | Global Context Manager         |
| `"repository"`      | Internal Component Repository  |

---

## 11. Helper Functions

OpenScript provides a suite of global utility functions to make your life easier.

### Logic Helpers

These are available globally (like `console` or `Math`).

#### 1. `ifElse(condition, trueValue, falseValue)`

A smarter ternary operator. If you pass **functions** as the values, they are only executed if chosen (lazy evaluation).

```javascript
// Simple
const status = ifElse(isOnline, "Online", "Offline");

// Lazy (Function is only called if isValid is true)
const result = ifElse(isValid, () => heavyCalculation(), "Invalid");
```

#### 2. `coalesce(value1, value2)`

Returns the first value that isn't `null` or `undefined`. Great for defaults.

```javascript
const displayName = coalesce(user.nickname, user.name, "Guest");
```

#### 3. `each(list, callback)`

Safely iterate over **Arrays** OR **Objects**.

```javascript
// Array
each([1, 2, 3], (val) => console.log(val));

// Object
each({ a: 1, b: 2 }, (val, key) => console.log(`${key}: ${val}`));
```

### DOM Utilities (`dom`)

Forget `document.querySelector` and friends. Use `dom`.

- **`dom.id("my-id")`**: Shortcut for `getElementById`.
- **`dom.get(".class")`**: Shortcut for `querySelector`.
- **`dom.all("div")`**: Shortcut for `querySelectorAll`.
- **`dom.put("<b>Hi</b>", el)`**: Sets innerHTML (safely).

### Framework Helpers

- **`app(name)`**: Access services from the IoC container.
- **`component(uid)`**: Find a live component instance by its ID.
- **`state(val)`**: Create a new state.
- **`context(name)`**: Access a global context.
- **`v(state, cb)`**: Create an anonymous reactive text node.

---

## 12. Tailwind Integration

OpenScript works seamlessly with TailwindCSS. The JIT engine automatically scans your JS files for class names.

### 1. How it Works

Tailwind looks for strings in your code that match class names.
Because OpenScript uses standard `class: "..."` attributes, it Just Works™.

```javascript
// Tailwind sees this string and generates the CSS!
h.div({ class: "bg-blue-500 text-white p-4 rounded" }, "Hello!");
```

### 2. Dynamic Classes (The "Safelist" Trap)

Tailwind analyzes your code **statically** (it reads text, it doesn't run code).
This means you **CANNOT** construct class names dynamically if the full string doesn't exist in your code.

```javascript
// ❌ WRONG: Tailwind won't see "bg-red-500"
const color = "red";
h.div({ class: `bg-${color}-500` });

// ✅ CORRECT: Full strings
const classes = isError ? "bg-red-500" : "bg-blue-500";
h.div({ class: classes });
```

**Solution:** If you MUST build dynamic strings, you need to add the patterns to the `safelist` in your `tailwind.config.js`.

```javascript
// tailwind.config.js
module.exports = {
  safelist: [
    { pattern: /bg-(red|green|blue)-(100|500)/ }, // Forces these to ALWAYS be included
  ],
};
```

### 3. Best Practices

#### Helper Functions

For conditional classes, just like React/Vue, use a helper or template literals.

```javascript
// Cleaner than ternary soup
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

h.button({
  class: classNames(
    "px-4 py-2 rounded", // Always applied
    isActive && "bg-blue-500", // Only if active
    isDisabled && "opacity-50", // Only if disabled
  ),
});
```

#### Custom Styles (`@apply`)

If a class string gets too long, extract it to CSS using `@apply`.

```css
/* src/style.css */
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
```

```javascript
h.button({ class: "btn-primary" }, "Click Me");
```

---

## 🤝 Contributing

Thank you for considering contributing to the OpenScriptJs framework! The contribution guide works as follows:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

If you discover a security vulnerability within OpenScriptJs, please send an e-mail to Levi Kamara Zwannah via [levizwannah@gmail.com](mailto:levizwannah@gmail.com). All security vulnerabilities will be promptly addressed.

## 🐛 Reporting Bugs

If you encounter any bugs or issues, please report them using the [GitHub Issue Tracker](https://github.com/OpenScriptJs/modular-openscript/issues). Please include:

- A detailed description of the bug.
- Steps to reproduce the behavior.
- Expected vs. actual results.
- Screenshots or code snippets if applicable.

## 📜 License

The OpenScriptJs framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## ✍️ Author

OpenScriptJs is a product of **Levi Kamara Zwannah**.

---

_Built with ❤️ for developers who love code._
