# Modular OpenScript Framework

[![npm version](https://badge.fury.io/js/modular-openscriptjs.svg)](https://www.npmjs.com/package/modular-openscriptjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, lightweight, reactive JavaScript framework for building scalable web applications with **zero runtime dependencies**. OpenScript combines IoC, reactive state management, and component-based architecture into a powerful yet simple package.

## ✨ Why OpenScript?

- ⚡️ **Reactive State** - Automatic UI updates with proxy-based state
- 🧩 **Component-Based** - Modular, reusable components with lifecycle hooks
- 🔄 **Client-Side Routing** - Fluent API with parameters and nested routes
- 📡 **Event-Driven** - Broker/Mediator pattern for decoupled architecture
- 🎯 **IoC Container** - Centralized dependency management
- 🎨 **Framework Agnostic** - Works with Tailwind, Bootstrap, or vanilla CSS
- 🛠️ **Vite Plugin** - Production-ready build tools
- 📦 **Zero Dependencies** - No runtime dependencies

---

## 🚀 Quick Start

### Installation

```bash
npm install modular-openscriptjs
```

### Scaffold a New Project

The fastest way to start:

```bash
npx create-ojs-app my-app
cd my-app
npm run dev
```

**Choose from templates:**

- `basic` - Clean starter with vanilla CSS
- `tailwind` - TailwindCSS with responsive design
- `bootstrap` - Bootstrap 5 integration

### Your First Component

```javascript
import { Component, app, state, ojs } from "modular-openscriptjs";

const h = app("h");

class Counter extends Component {
  constructor() {
    super();
    this.count = state(0);
  }

  increment() {
    this.count.value++;
  }

  render() {
    return h.div(
      h.h2("Count: ", this.count.value),
      h.button({ onclick: this.increment.bind(this) }, "Increment")
    );
  }
}

ojs(Counter);
```

---

## 📖 Core Concepts

### 1. Components

**Class Components** with lifecycle hooks:

```javascript
import { Component, app } from "modular-openscriptjs";

const h = app("h");

class UserCard extends Component {
  async mount() {
    // Called when component mounts
    console.log("Component mounted");
  }

  unmount() {
    // Called when component unmounts
    console.log("Component unmounted");
  }

  render(...args) {
    return h.div(
      { class: "card" },
      h.h3("User Profile"),
      h.p("Content here"),
      ...args
    );
  }
}
```

**Functional Components** for simple UI:

```javascript
const Button = (text, onClick) => {
  return h.button({ onclick: onClick }, text);
};

const Card = (title, content) => {
  return h.div({ class: "card" }, h.h2(title), h.div(content));
};
```

### 2. Reactive State

State automatically triggers re-renders:

```javascript
import { state } from "modular-openscriptjs";

// Create reactive state
const count = state(0);

// Read value
console.log(count.value); // 0

// Update value (triggers re-render)
count.value++;

// Listen to changes
count.listener((s) => {
  console.log("New:", s.value);
  console.log("Previous:", s.previousValue);
});
```

**State in Components:**

```javascript
class TodoList extends Component {
  constructor() {
    super();
    this.todos = state([]);
  }

  addTodo(text) {
    this.todos.value = [
      ...this.todos.value,
      { id: Date.now(), text, done: false },
    ];
  }

  toggleTodo(id) {
    this.todos.value = this.todos.value.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  }

  render() {
    return h.div(
      h.input({
        placeholder: "Add todo...",
        onkeypress: (e) => {
          if (e.key === "Enter") {
            this.addTodo(e.target.value);
            e.target.value = "";
          }
        },
      }),
      h.ul(
        ...this.todos.value.map((todo) =>
          h.li(
            { class: todo.done ? "done" : "" },
            h.input({
              type: "checkbox",
              checked: todo.done,
              onchange: () => this.toggleTodo(todo.id),
            }),
            h.span(todo.text)
          )
        )
      )
    );
  }
}
```

### 3. Routing

Simple yet powerful client-side routing:

```javascript
import { app } from "modular-openscriptjs";

const router = app("router");
const h = app("h");

// Basic routes
router.on(
  "/",
  () => {
    h.HomePage({ parent: document.body, resetParent: true });
  },
  "home"
);

router.on(
  "/about",
  () => {
    h.AboutPage({ parent: document.body, resetParent: true });
  },
  "about"
);

// Routes with parameters
router.on(
  "/users/{id}",
  () => {
    const userId = router.params.id;
    h.UserProfile(userId, { parent: document.body, resetParent: true });
  },
  "users.view"
);

// Grouped routes
router.prefix("admin").group(() => {
  router.on(
    "/dashboard",
    () => {
      h.AdminDashboard({ parent: document.body, resetParent: true });
    },
    "admin.dashboard"
  );

  router.on(
    "/users",
    () => {
      h.AdminUsers({ parent: document.body, resetParent: true });
    },
    "admin.users"
  );
});

router.listen();
```

**Navigation:**

```javascript
// Navigate to named route
router.to("home");

// Navigate with parameters
router.push("/users/123");

// Go back
router.back();
```

### 4. Global State with Contexts

Share state across your entire application:

```javascript
import { context, putContext, app } from "modular-openscriptjs";

const h = app("h");

// Register contexts
putContext(["app", "user"], "AppContext");

// Initialize state
const ac = context("app");
ac.states({
  theme: "light",
  language: "en",
});

const uc = context("user");
uc.states({
  name: "Guest",
  isLoggedIn: false,
});

// Use in any component
class Header extends Component {
  toggleTheme() {
    ac.theme.value = ac.theme.value === "light" ? "dark" : "light";
  }

  render() {
    return h.header(
      h.h1(`Welcome, ${uc.name.value}`),
      h.button(
        { onclick: this.toggleTheme.bind(this) },
        `Theme: ${ac.theme.value}`
      )
    );
  }
}
```

### 5. Event System

Decouple business logic with events:

```javascript
import { Mediator, app, payload, Utils } from "modular-openscriptjs";

const broker = app("broker");

// Register events
broker.registerEvents({
  user: {
    login: true,
    logout: true,
  },
  notification: {
    show: true,
  },
});

// Create mediator for business logic
class UserMediator extends Mediator {
  $$user = {
    login: (ed, event) => {
      const data = Utils.parsePayload(ed);
      console.log("User logged in:", data.message);

      // Update UI
      broker.send(
        "notification:show",
        payload({
          message: "Login successful!",
        })
      );
    },

    logout: (ed, event) => {
      console.log("User logged out");

      broker.send(
        "notification:show",
        payload({
          message: "Goodbye!",
        })
      );
    },
  };
}

new UserMediator();

// Emit events from anywhere
class LoginButton extends Component {
  handleLogin() {
    broker.send(
      "user:login",
      payload({
        username: "john_doe",
        id: 123,
      })
    );
  }

  render() {
    return h.button({ onclick: this.handleLogin.bind(this) }, "Login");
  }
}
```

### 6. IoC Container

Access services through the container:

```javascript
import { app } from "modular-openscriptjs";

// Get services
const h = app("h");
const router = app("router");
const broker = app("broker");
const contextProvider = app("contextProvider");

// Register custom values
app().value("apiUrl", "https://api.example.com");
app().value("config", { debug: true });

// Access custom values
const apiUrl = app("apiUrl");
const config = app("config");
```

---

## 🏗️ Project Structure

Typical project layout:

```
my-app/
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── TodoList.js
│   ├── contexts.js      # Global state
│   ├── routes.js        # Route definitions
│   ├── events.js        # Event registry
│   ├── mediators/       # Business logic
│   │   └── UserMediator.js
│   ├── main.js          # Entry point
│   └── style.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 🎨 Framework Integration

### TailwindCSS

```javascript
import { app } from "modular-openscriptjs";

const h = app("h");

class Card extends Component {
  render() {
    return h.div(
      { class: "bg-white rounded-lg shadow-lg p-6" },
      h.h2({ class: "text-2xl font-bold mb-4" }, "Card Title"),
      h.p({ class: "text-gray-600" }, "Card content here")
    );
  }
}
```

### Bootstrap

```javascript
class Alert extends Component {
  render(message, type = "info") {
    return h.div({ class: `alert alert-${type}` }, message);
  }
}
```

---

## 🔧 Build Configuration

### Vite Setup

```javascript
// vite.config.js
import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  plugins: [openScriptComponentPlugin()],
  build: {
    target: "es2015",
    minify: "terser",
  },
});
```

This plugin ensures component names survive minification.

### Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 💡 Advanced Features

### Fragments

Return multiple elements without a wrapper:

```javascript
class List extends Component {
  render() {
    return h.$(
      // Fragment
      h.h1("Title"),
      h.p("Paragraph 1"),
      h.p("Paragraph 2")
    );
  }
}
```

### State Listeners

React to state changes:

```javascript
const count = state(0);

count.listener((s) => {
  console.log(`Count changed from ${s.previousValue} to ${s.value}`);

  if (s.value > 10) {
    console.warn("Count is getting high!");
  }
});
```

### Multi-Event Listeners

Listen to multiple events:

```javascript
class NotificationMediator extends Mediator {
  $$user = {
    // Triggers on BOTH login AND logout
    login_logout: (ed, event) => {
      console.log(`User event: ${event}`);
      this.showNotification(`User ${event.split(":")[1]}`);
    },
  };
}
```

### Computed Properties

Use getters for derived state:

```javascript
class TodoList extends Component {
  constructor() {
    super();
    this.todos = state([]);
  }

  get completedCount() {
    return this.todos.value.filter((t) => t.done).length;
  }

  get activeCount() {
    return this.todos.value.length - this.completedCount;
  }

  render() {
    return h.div(
      h.p(`${this.activeCount} active, ${this.completedCount} completed`)
      // ... rest of render
    );
  }
}
```

---

## 📚 Complete Example

Here's a full-featured app:

```javascript
import {
  Component,
  app,
  state,
  context,
  putContext,
  Mediator,
  payload,
  ojs,
} from "modular-openscriptjs";

const h = app("h");
const broker = app("broker");

// Setup context
putContext("todos", "TodoContext");
const tc = context("todos");
tc.states({ todos: [], filter: "all" });

// Register events
broker.registerEvents({
  todo: {
    added: true,
    removed: true,
    toggled: true,
  },
});

// Business logic mediator
class TodoMediator extends Mediator {
  $$todo = {
    added: (ed) => {
      console.log("Todo added:", ed);
    },

    removed: (ed) => {
      console.log("Todo removed:", ed);
    },

    toggled: (ed) => {
      console.log("Todo toggled:", ed);
    },
  };
}

new TodoMediator();

// Main component
class TodoApp extends Component {
  constructor() {
    super();
    this.input = state("");
  }

  addTodo() {
    if (this.input.value.trim()) {
      const todo = {
        id: Date.now(),
        text: this.input.value,
        done: false,
      };

      tc.todos.value = [...tc.todos.value, todo];
      broker.send("todo:added", payload(todo));
      this.input.value = "";
    }
  }

  toggleTodo(id) {
    tc.todos.value = tc.todos.value.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    broker.send("todo:toggled", payload({ id }));
  }

  removeTodo(id) {
    tc.todos.value = tc.todos.value.filter((t) => t.id !== id);
    broker.send("todo:removed", payload({ id }));
  }

  get filteredTodos() {
    switch (tc.filter.value) {
      case "active":
        return tc.todos.value.filter((t) => !t.done);
      case "done":
        return tc.todos.value.filter((t) => t.done);
      default:
        return tc.todos.value;
    }
  }

  render() {
    return h.div(
      { class: "todo-app" },

      // Header
      h.header(
        h.h1("My Todos"),
        h.div(
          { class: "input-group" },
          h.input({
            value: this.input.value,
            placeholder: "What needs to be done?",
            oninput: (e) => (this.input.value = e.target.value),
            onkeypress: (e) => e.key === "Enter" && this.addTodo(),
          }),
          h.button({ onclick: () => this.addTodo() }, "Add")
        )
      ),

      // Filters
      h.div(
        { class: "filters" },
        ...["all", "active", "done"].map((f) =>
          h.button(
            {
              class: tc.filter.value === f ? "active" : "",
              onclick: () => (tc.filter.value = f),
            },
            f.toUpperCase()
          )
        )
      ),

      // Todo list
      h.ul(
        ...this.filteredTodos.map((todo) =>
          h.li(
            h.input({
              type: "checkbox",
              checked: todo.done,
              onchange: () => this.toggleTodo(todo.id),
            }),
            h.span({ class: todo.done ? "done" : "" }, todo.text),
            h.button({ onclick: () => this.removeTodo(todo.id) }, "×")
          )
        )
      ),

      // Stats
      h.footer(h.span(`${this.filteredTodos.length} items`))
    );
  }
}

ojs(TodoApp);
```

---

## 📖 API Reference

### Core Exports

| Export       | Type     | Description           |
| ------------ | -------- | --------------------- |
| `Component`  | Class    | Base component class  |
| `app`        | Function | Access IoC container  |
| `state`      | Function | Create reactive state |
| `ojs`        | Function | Bootstrap application |
| `context`    | Function | Access context        |
| `putContext` | Function | Register context      |
| `Mediator`   | Class    | Base mediator class   |
| `payload`    | Function | Create event payload  |
| `Utils`      | Object   | Utility functions     |

### Component Lifecycle

| Method          | Description                         |
| --------------- | ----------------------------------- |
| `constructor()` | Initialize component                |
| `mount()`       | Component mounted (async supported) |
| `render()`      | Generate component UI               |
| `unmount()`     | Component unmounted                 |

### State API

| Property/Method  | Description                        |
| ---------------- | ---------------------------------- |
| `.value`         | Get/set state value                |
| `.listener(fn)`  | Add state change listener          |
| `.previousValue` | Previous state value (in listener) |

---

## 🎯 Best Practices

### ✅ Do's

- Use contexts for global state
- Keep components small and focused
- Leverage lifecycle hooks appropriately
- Use mediators for business logic
- Use computed properties for derived state

### ❌ Don'ts

- Don't mutate state directly
- Don't mix business logic with UI
- Don't create functions in render
- Don't emit events in tight loops

---

## 🐛 Troubleshooting

**Component not re-rendering?**

- Ensure state is updated via `.value =`
- Verify state is used in `render()`

**Events not firing?**

- Check events are registered
- Verify event names match exactly

**Router not working?**

- Call `router.listen()` after defining routes
- Check route paths are correct

---

## 📦 Package Info

- **Size**: ~95KB (ES), ~42KB (UMD)
- **Dependencies**: Zero runtime dependencies
- **Browser Support**: Modern browsers (ES6+)
- **License**: MIT

---

## 📚 Learn More

- [Full Documentation](https://github.com/yourusername/modular-openscriptjs)
- [Examples](https://github.com/yourusername/modular-openscriptjs/tree/main/examples)
- [API Reference](https://github.com/yourusername/modular-openscriptjs/wiki)
- [Issue Tracker](https://github.com/yourusername/modular-openscriptjs/issues)

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](https://github.com/yourusername/modular-openscriptjs/blob/main/CONTRIBUTING.md).

---

## 📄 License

MIT © Levi Kamara Zwannah

---

**Built with ❤️ using OpenScript**

[⭐ Star on GitHub](https://github.com/yourusername/modular-openscriptjs) | [📦 View on npm](https://www.npmjs.com/package/modular-openscriptjs)
