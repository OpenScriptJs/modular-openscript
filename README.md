# Modular OpenScript Framework

A modern, modular, event-driven JavaScript framework built for scalability and maintainability. OpenScript combines the power of **Inversion of Control (IoC)**, **Reactive State Management**, and a **Component-Based Architecture** into a lightweight package.

## 🚀 Key Features

- **IoC Container**: Centralized dependency management using a robust container and `app()` helper.
- **Reactive State**: Simple, proxy-based state management with automatic UI updates.
- **Event-Driven**: Powerful `Broker` and `Mediator` pattern for decoupled communication.
- **Component-Based**: Class-based components with lifecycle hooks and functional stateless components.
- **Fluent Router**: Expressive, fluent API for client-side routing.
- **Lightweight**: Zero dependencies (other than dev tools), pure JavaScript.

---

## 📦 Installation

```bash
npm install modular-openscript
```

---

## ⚡ Quick Start

Create a simple counter application in seconds.

```javascript
import { Component, h, state, ojs } from "modular-openscript";

// 1. Define State
const counter = state(0);

// 2. Create Component
class CounterApp extends Component {
  render() {
    return h.div(
      h.h1(`Count: ${counter.value}`),
      h.button({ onclick: () => counter.value++ }, "Increment")
    );
  }
}

// 3. Run Application
ojs(CounterApp);
```

---

## 🏗️ Architecture Overview

OpenScript is built around a central **IoC Container**. Instead of importing global instances, you access core services via the `app()` helper.

### Core Services

- **`app('broker')`**: The central event bus.
- **`app('router')`**: The client-side router.
- **`app('contextProvider')`**: Manages application contexts.

### The `app()` Helper

The `app()` function is your gateway to the container:

```javascript
import { app } from "modular-openscript";

// Access services
const router = app("router");
const broker = app("broker");

// Register values
app().value("myConfig", { debug: true });
```

---

## 🧩 Components

Components are the building blocks of your UI. They can be **Class-based** (stateful) or **Functional** (stateless).

### Class Components

Extend `Component` to create stateful components with lifecycle hooks.

```javascript
import { Component, h } from "modular-openscript";

class MyComponent extends Component {
  // Lifecycle: Called when component is mounted to DOM
  async mount() {
    console.log("Mounted!");
  }

  render(...args) {
    return h.div("Hello World", ...args);
  }
}
```

### Functional Components

Simple functions that return markup. Great for presentational UI.

```javascript
const Button = (text, onclick) => {
  return h.button({ onclick }, text);
};
```

### The `h` Builder

OpenScript uses a hyperscript-like helper `h` to build DOM elements.

```javascript
h.div(
  { class: "container", id: "main" }, // Attributes
  h.h1("Title"), // Children
  h.p("Content")
);
```

**Special Attributes:**

- **`listeners`**: Object of event listeners (`{ click: () => ... }`).
- **`parent`**: DOM element to append to.
- **`resetParent`**: If `true`, clears parent before appending.
- **`component`**: Attach a component instance to the element.
- **`$_method`**: Prefix component methods with `$_` to use them as event handlers in markup.

---

## 🔄 State Management

State is reactive by default. When state changes, any component using that state automatically re-renders.

### Basic State

```javascript
import { state } from "modular-openscript";

const count = state(0);

// Update value -> triggers UI updates
count.value++;

// Listen to changes
count.listener((s) => console.log(s.value));
```

### Contexts

Contexts group related states and make them globally available.

```javascript
import { context, putContext } from "modular-openscript";

// 1. Register Context
putContext("user", "UserContext");

// 2. Initialize States
const uc = context("user");
uc.states({
  name: "Guest",
  isLoggedIn: false,
});

// 3. Use in Component
class UserProfile extends Component {
  render() {
    // Component auto-updates when uc.name changes
    return h.div(`User: ${uc.name.value}`);
  }
}
```

---

## 📡 Event System

OpenScript uses a **Broker/Mediator** pattern to decouple business logic from UI.

### 1. Register Events

Define your events in a structured object.

```javascript
const $e = {
  user: {
    login: true,
    logout: true,
  },
};

app("broker").registerEvents($e);
```

### 2. Mediators (Listeners)

Mediators handle business logic. Use the `$$` prefix to auto-register listeners.

```javascript
import { Mediator, payload } from "modular-openscript";

class AuthMediator extends Mediator {
  $$user = {
    // Listens to 'user:login'
    login: (ed, event) => {
      console.log("User logged in!");
    },
  };
}
```

### 3. Emitting Events

Send events from components or other services.

```javascript
app("broker").send("user:login", payload({ id: 1 }));
```

---

## 🛣️ Routing

The router uses a fluent API for defining routes.

```javascript
const router = app("router");

// Basic Route
router.on(
  "/",
  () => {
    context("page").view.value = "home";
  },
  "home"
);

// Grouped Routes
router.prefix("users").group(() => {
  router.on(
    "/{id}",
    () => {
      const userId = router.params.id;
      console.log("Viewing user:", userId);
    },
    "users.view"
  );
});

// Start Router
router.listen();
```

---

## 📚 Examples

Check the `examples/` directory for detailed usage patterns:

- **`basic-usage.js`**: Simple counter app.
- **`advanced-features.js`**: Fragments and manual context registration.
- **`component-example.js`**: Component communication.
- **`event-handling.js`**: Mediators and event patterns.
- **`full-application.js`**: A complete "Real World" application structure.
- **`state-example.js`**: Deep dive into state patterns.

---

## 🛠️ Advanced

### Manual Context Registration

If you need to register a context instance manually (e.g., for testing):

```javascript
class MyContext {
  theme = state("dark");
}

app("contextProvider").map.set("Theme", new MyContext());
```

### Customizing the Runner

The `ojs()` function is a wrapper around `Runner`. You can also use `Runner` directly if needed, but `ojs()` is recommended for simplicity.

```javascript
import { Runner } from "modular-openscript";

const runner = new Runner();
runner.run(MyComponent);
```

---

## 📄 License

MIT
