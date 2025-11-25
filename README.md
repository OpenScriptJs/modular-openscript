# Modular OpenScript Framework

A modern, modular, event-driven JavaScript framework built for scalability and maintainability. OpenScript combines the power of **Inversion of Control (IoC)**, **Reactive State Management**, and a **Component-Based Architecture** into a lightweight package with zero runtime dependencies.

## 🚀 Key Features

- **IoC Container**: Centralized dependency management using a robust container and `app()` helper
- **Reactive State**: Proxy-based state management with automatic UI updates
- **Event-Driven**: Powerful `Broker` and `Mediator` pattern for decoupled communication
- **Component-Based**: Class-based components with lifecycle hooks and functional stateless components
- **Fluent Router**: Expressive, fluent API for client-side routing with nested routes
- **Lightweight**: Zero runtime dependencies, pure JavaScript
- **TypeScript Ready**: Built with modern ES6+ features
- **Vite Plugin**: Build tools for minification-safe production builds

---

## 📦 Installation

### Using npm/yarn

```bash
npm install modular-openscriptjs
# or
yarn add modular-openscriptjs
```

### Create a New Project

The fastest way to get started is using the project scaffolding tool:

```bash
npx create-ojs-app my-app
cd my-app
npm run dev
```

**Available Templates:**

- `basic` - Clean starter with vanilla CSS and simple structure
- `tailwind` - Pre-configured with TailwindCSS and responsive design
- `bootstrap` - Bootstrap 5 integration with utility classes

---

## ⚡ Quick Start

Create a simple counter application in seconds.

```javascript
import { Component, app, state, ojs } from "modular-openscriptjs";

const h = app("h");

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

The framework provides these built-in services through the container:

| Service             | Access                   | Description                                   |
| ------------------- | ------------------------ | --------------------------------------------- |
| **h**               | `app('h')`               | Hyperscript builder for creating DOM elements |
| **broker**          | `app('broker')`          | Event bus for application-wide communication  |
| **router**          | `app('router')`          | Client-side routing manager                   |
| **contextProvider** | `app('contextProvider')` | Manages application contexts                  |
| **mediatorManager** | `app('mediatorManager')` | Handles mediator registration                 |
| **loader**          | `app('loader')`          | Auto-loader for dynamic imports               |

### The `app()` Helper

The `app()` function is your gateway to the container:

```javascript
import { app } from "modular-openscriptjs";

// Access services
const h = app("h");
const router = app("router");
const broker = app("broker");

// Register custom values
app().value("apiUrl", "https://api.example.com");
app().value("config", { debug: true, theme: "dark" });

// Access registered values
const apiUrl = app("apiUrl");
const config = app("config");
```

**Benefits:**

- Single source of truth for dependencies
- Easy to mock services for testing
- Runtime service replacement
- Better code organization

---

## 🧩 Components

Components are the building blocks of your UI. They can be **Class-based** (stateful) or **Functional** (stateless).

### Class Components

Extend `Component` to create stateful components with lifecycle hooks.

```javascript
import { Component, app, state } from "modular-openscriptjs";

const h = app("h");

class UserProfile extends Component {
  constructor() {
    super();
    this.username = state("Guest");
    this.avatar = state("/default-avatar.png");
  }

  // Lifecycle: Called when component is mounted to DOM
  async mount() {
    console.log("Component mounted!");
    // Fetch user data, set up listeners, etc.
    await this.loadUserData();
  }

  // Lifecycle: Called when component is removed from DOM
  unmount() {
    console.log("Component unmounted!");
    // Clean up listeners, timers, etc.
  }

  async loadUserData() {
    const apiUrl = app("apiUrl");
    const response = await fetch(`${apiUrl}/user`);
    const data = await response.json();
    this.username.value = data.name;
    this.avatar.value = data.avatar;
  }

  render(...args) {
    return h.div(
      { class: "user-profile" },
      h.img({ src: this.avatar.value, alt: "Avatar" }),
      h.h2(this.username.value),
      ...args
    );
  }
}
```

**Component Lifecycle:**

1. `constructor()` - Initialize state and properties
2. `mount()` - Component added to DOM (async supported)
3. `render()` - Generate component markup
4. `unmount()` - Component removed from DOM

### Functional Components

Simple functions that return markup. Great for presentational UI.

```javascript
const Button = (text, onclick, variant = "primary") => {
  return h.button(
    {
      class: `btn btn-${variant}`,
      onclick,
    },
    text
  );
};

const Card = (title, content) => {
  return h.div(
    { class: "card" },
    h.div({ class: "card-header" }, h.h3(title)),
    h.div({ class: "card-body" }, content)
  );
};

// Usage
h.div(
  Button("Click Me", () => console.log("Clicked!"), "success"),
  Card("Welcome", h.p("This is a card component"))
);
```

### The `h` Builder (Hyperscript)

OpenScript uses a hyperscript-like helper `h` to build DOM elements efficiently.

```javascript
const h = app("h");

// Basic element
h.div("Hello World");

// With attributes
h.div({ class: "container", id: "main" }, "Content");

// Nested elements
h.div(
  { class: "card" },
  h.header(h.h1("Title")),
  h.section(h.p("Paragraph 1"), h.p("Paragraph 2")),
  h.footer(h.small("Footer text"))
);

// Arrays of elements
h.ul(...["Apple", "Banana", "Cherry"].map((fruit) => h.li(fruit)));
```

**Special Attributes:**

| Attribute                   | Description                   | Example                        |
| --------------------------- | ----------------------------- | ------------------------------ |
| `listeners`                 | Object of event listeners     | `{ listeners: { click: fn } }` |
| `parent`                    | DOM element to append to      | `{ parent: document.body }`    |
| `resetParent`               | Clear parent before appending | `{ resetParent: true }`        |
| `component`                 | Attach component instance     | `{ component: myComponent }`   |
| `onclick`, `onchange`, etc. | Direct event handlers         | `{ onclick: () => {} }`        |

**Component Methods as Event Handlers:**

Prefix component methods with `$_` to use them directly in markup:

```javascript
class MyComponent extends Component {
  $_handleClick(event) {
    console.log("Button clicked", event);
  }

  render() {
    return h.button({ onclick: this.$_handleClick }, "Click Me");
  }
}
```

---

## 🔄 State Management

State is reactive by default. When state changes, any component using that state automatically re-renders.

### Basic State

```javascript
import { state } from "modular-openscriptjs";

// Create reactive state
const count = state(0);

// Read value
console.log(count.value); // 0

// Update value -> triggers UI updates
count.value++;

// Listen to changes
count.listener((stateObj) => {
  console.log("New value:", stateObj.value);
  console.log("Previous value:", stateObj.previousValue);
});

// Conditional updates
if (count.value > 10) {
  count.value = 0;
}
```

### State in Components

```javascript
class TodoList extends Component {
  constructor() {
    super();
    this.todos = state([]);
    this.filter = state("all"); // "all", "active", "completed"
  }

  addTodo(text) {
    this.todos.value = [
      ...this.todos.value,
      { id: Date.now(), text, completed: false },
    ];
  }

  toggleTodo(id) {
    this.todos.value = this.todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  removeTodo(id) {
    this.todos.value = this.todos.value.filter((todo) => todo.id !== id);
  }

  get filteredTodos() {
    switch (this.filter.value) {
      case "active":
        return this.todos.value.filter((t) => !t.completed);
      case "completed":
        return this.todos.value.filter((t) => t.completed);
      default:
        return this.todos.value;
    }
  }

  render() {
    return h.div(
      h.input({
        type: "text",
        placeholder: "Add todo...",
        onkeypress: (e) => {
          if (e.key === "Enter" && e.target.value) {
            this.addTodo(e.target.value);
            e.target.value = "";
          }
        },
      }),
      h.div(
        ...["all", "active", "completed"].map((filter) =>
          h.button(
            {
              class: this.filter.value === filter ? "active" : "",
              onclick: () => (this.filter.value = filter),
            },
            filter.toUpperCase()
          )
        )
      ),
      h.ul(
        ...this.filteredTodos.map((todo) =>
          h.li(
            { class: todo.completed ? "completed" : "" },
            h.input({
              type: "checkbox",
              checked: todo.completed,
              onchange: () => this.toggleTodo(todo.id),
            }),
            h.span(todo.text),
            h.button({ onclick: () => this.removeTodo(todo.id) }, "×")
          )
        )
      )
    );
  }
}
```

### Contexts

Contexts group related states and make them globally available across your application.

```javascript
import { context, putContext, Component, app } from "modular-openscriptjs";

const h = app("h");

// 1. Register Context
putContext("user", "UserContext");
putContext("app", "AppContext");

// 2. Initialize States
const uc = context("user");
uc.states({
  name: "Guest",
  email: "",
  isLoggedIn: false,
  role: "guest",
});

const ac = context("app");
ac.states({
  theme: "light",
  language: "en",
  notifications: [],
});

// 3. Use in Components
class UserProfile extends Component {
  render() {
    // Component auto-updates when uc.name or uc.email changes
    return h.div(
      h.h2(`Welcome, ${uc.name.value}!`),
      h.p(`Email: ${uc.email.value}`),
      h.p(`Role: ${uc.role.value}`),
      uc.isLoggedIn.value
        ? h.button({ onclick: this.logout }, "Logout")
        : h.button({ onclick: this.login }, "Login")
    );
  }

  login() {
    uc.name.value = "John Doe";
    uc.email.value = "john@example.com";
    uc.isLoggedIn.value = true;
    uc.role.value = "admin";
  }

  logout() {
    uc.name.value = "Guest";
    uc.email.value = "";
    uc.isLoggedIn.value = false;
    uc.role.value = "guest";
  }
}

// 4. Access from anywhere
class ThemeToggle extends Component {
  toggleTheme() {
    ac.theme.value = ac.theme.value === "light" ? "dark" : "light";
  }

  render() {
    return h.button(
      { onclick: this.toggleTheme.bind(this) },
      `Theme: ${ac.theme.value}`
    );
  }
}
```

**Best Practices:**

- Use contexts for truly global state
- Keep related state together
- Use meaningful context names
- Initialize all states upfront

---

## 📡 Event System

OpenScript uses a **Broker/Mediator** pattern to decouple business logic from UI components.

### 1. Register Events

Define your events in a structured object:

```javascript
import { app } from "modular-openscriptjs";

const broker = app("broker");

const $e = {
  user: {
    login: true,
    logout: true,
    registered: true,
    profileUpdated: true,
  },
  todo: {
    added: true,
    removed: true,
    completed: true,
    uncompleted: true,
  },
  app: {
    initialized: true,
    themeChanged: true,
    errorOccurred: true,
  },
};

// Register all events
broker.registerEvents($e);
```

Event names become namespaced: `user:login`, `todo:added`, etc.

### 2. Mediators (Business Logic Handlers)

Mediators handle business logic and respond to events:

```javascript
import { Mediator, payload, app } from "modular-openscriptjs";

const broker = app("broker");

class AuthMediator extends Mediator {
  // The '$$' prefix auto-registers these as event listeners
  $$user = {
    // Listens to 'user:login'
    login: (ed, eventName) => {
      const data = Utils.parsePayload(ed);
      console.log("User logged in:", data.message);

      // Perform business logic
      this.saveToLocalStorage(data.message);
      this.updateAnalytics("login", data.message);

      // Emit subsequent events
      broker.send(
        "user:profileUpdated",
        payload({
          userId: data.message.id,
        })
      );
    },

    // Listens to 'user:logout'
    logout: (ed, eventName) => {
      console.log("User logged out");
      this.clearLocalStorage();
      this.updateAnalytics("logout");
    },

    // Listens to 'user:registered'
    registered: (ed, eventName) => {
      const data = Utils.parsePayload(ed);
      this.sendWelcomeEmail(data.message.email);
      this.createUserProfile(data.message);
    },
  };

  $$app = {
    errorOccurred: (ed, eventName) => {
      const error = Utils.parsePayload(ed).message;
      this.logErrorToService(error);
      this.showNotification("An error occurred", "error");
    },
  };

  saveToLocalStorage(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  clearLocalStorage() {
    localStorage.removeItem("user");
  }

  updateAnalytics(action, data = {}) {
    // Send to analytics service
    console.log("Analytics:", action, data);
  }

  sendWelcomeEmail(email) {
    // API call to send email
    console.log("Sending welcome email to:", email);
  }

  createUserProfile(user) {
    // API call to create profile
    console.log("Creating profile for:", user);
  }

  logErrorToService(error) {
    // Send to error tracking service
    console.error("Error logged:", error);
  }

  showNotification(message, type) {
    // Show UI notification
    broker.send("ui:showNotification", payload({ message, type }));
  }
}

// Instantiate mediator (auto-registers all listeners)
new AuthMediator();
```

### 3. Multi-Event Listeners

Listen to multiple events with a single handler using underscore:

```javascript
class NotificationMediator extends Mediator {
  $$user = {
    // Triggers on BOTH 'user:login' AND 'user:logout'
    login_logout: (ed, eventName) => {
      console.log(`User authentication event: ${eventName}`);
      this.showNotification(`User ${eventName.split(":")[1]} event occurred`);
    },
  };
}
```

### 4. Emitting Events

Send events from anywhere in your application:

```javascript
import { app, payload } from "modular-openscriptjs";

const broker = app("broker");

// Simple event
broker.send(
  "user:login",
  payload({
    id: 123,
    username: "john_doe",
  })
);

// With metadata
broker.send(
  "todo:added",
  payload(
    { todo: { id: 1, text: "Buy milk" } }, // message
    { timestamp: Date.now(), source: "ui" } // meta
  )
);

// Error event
broker.send(
  "app:errorOccurred",
  payload({
    error: new Error("Network failure"),
    context: "API request",
  })
);
```

### 5. Component Event Listeners

Components can also listen to events:

```javascript
class Dashboard extends Component {
  async mount() {
    // Subscribe to events
    app("broker").on("user:login", (ed) => {
      const user = Utils.parsePayload(ed).message;
      console.log("Dashboard received login:", user);
      this.refreshData();
    });

    app("broker").on("todo:added", (ed) => {
      this.updateTodoCount();
    });
  }

  refreshData() {
    // Reload dashboard data
  }

  updateTodoCount() {
    // Update todo counter
  }

  render() {
    return h.div({ class: "dashboard" }, "Dashboard Content");
  }
}
```

---

## 🛣️ Routing

The router uses a fluent API for defining routes with support for parameters, groups, and middleware.

### Basic Routing

```javascript
import { app, context } from "modular-openscriptjs";

const router = app("router");
const h = app("h");

// Define routes
router.on(
  "/",
  () => {
    h.HomePage({ parent: document.body, resetParent: true });
  },
  "home" // Route name
);

router.on(
  "/about",
  () => {
    h.AboutPage({ parent: document.body, resetParent: true });
  },
  "about"
);

router.on(
  "/contact",
  () => {
    h.ContactPage({ parent: document.body, resetParent: true });
  },
  "contact"
);

// Start listening to route changes
router.listen();
```

### Route Parameters

```javascript
// Single parameter
router.on(
  "/users/{id}",
  () => {
    const userId = router.params.id;
    console.log("Viewing user:", userId);
    h.UserProfile(userId, { parent: document.body, resetParent: true });
  },
  "users.view"
);

// Multiple parameters
router.on(
  "/posts/{postId}/comments/{commentId}",
  () => {
    const { postId, commentId } = router.params;
    console.log("Post:", postId, "Comment:", commentId);
    h.CommentView(postId, commentId, {
      parent: document.body,
      resetParent: true,
    });
  },
  "posts.comments.view"
);
```

### Grouped Routes

```javascript
// Group with prefix
router.prefix("admin").group(() => {
  router.on(
    "/",
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

  router.on(
    "/settings",
    () => {
      h.AdminSettings({ parent: document.body, resetParent: true });
    },
    "admin.settings"
  );
});
// Routes: /admin, /admin/users, /admin/settings

// Nested groups
router.prefix("api").group(() => {
  router.prefix("v1").group(() => {
    router.on(
      "/users",
      () => {
        /* ... */
      },
      "api.v1.users"
    );
    router.on(
      "/posts",
      () => {
        /* ... */
      },
      "api.v1.posts"
    );
  });
});
// Routes: /api/v1/users, /api/v1/posts
```

### Default Route

```javascript
// Redirect to home if no route matches
router.default(() => router.to("home"));

// Or show 404 page
router.default(() => {
  h.NotFoundPage({ parent: document.body, resetParent: true });
});
```

### Programmatic Navigation

```javascript
// Navigate to a named route
router.to("users.view");

// Navigate with parameters
router.push("/users/123");

// Navigate with state
router.to("profile", { userId: 456 });

// Go back
router.back();
```

### Router Base Path

```javascript
// Set base path for deployment in subdirectories
router.basePath("/my-app");

// Now routes are relative to /my-app
router.on("/home", () => { ... });  // Actual path: /my-app/home
```

---

## 📚 Examples

### Complete Todo App

```javascript
import {
  Component,
  app,
  state,
  context,
  putContext,
  ojs,
} from "modular-openscriptjs";

const h = app("h");

// Setup context
putContext("todos", "TodoContext");
const tc = context("todos");
tc.states({
  todos: [],
  filter: "all",
});

class TodoApp extends Component {
  constructor() {
    super();
    this.newTodoText = state("");
  }

  addTodo() {
    if (this.newTodoText.value.trim()) {
      tc.todos.value = [
        ...tc.todos.value,
        {
          id: Date.now(),
          text: this.newTodoText.value,
          completed: false,
        },
      ];
      this.newTodoText.value = "";
    }
  }

  toggleTodo(id) {
    tc.todos.value = tc.todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  deleteTodo(id) {
    tc.todos.value = tc.todos.value.filter((todo) => todo.id !== id);
  }

  get filteredTodos() {
    switch (tc.filter.value) {
      case "active":
        return tc.todos.value.filter((t) => !t.completed);
      case "completed":
        return tc.todos.value.filter((t) => t.completed);
      default:
        return tc.todos.value;
    }
  }

  get stats() {
    const total = tc.todos.value.length;
    const completed = tc.todos.value.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }

  render() {
    const stats = this.stats;

    return h.div(
      { class: "todo-app" },
      h.header(
        h.h1("My Todos"),
        h.p(`${stats.active} active, ${stats.completed} completed`)
      ),
      h.div(
        { class: "todo-input" },
        h.input({
          type: "text",
          placeholder: "What needs to be done?",
          value: this.newTodoText.value,
          oninput: (e) => (this.newTodoText.value = e.target.value),
          onkeypress: (e) => {
            if (e.key === "Enter") this.addTodo();
          },
        }),
        h.button({ onclick: () => this.addTodo() }, "Add")
      ),
      h.div(
        { class: "filters" },
        ...["all", "active", "completed"].map((filter) =>
          h.button(
            {
              class: tc.filter.value === filter ? "active" : "",
              onclick: () => (tc.filter.value = filter),
            },
            filter.charAt(0).toUpperCase() + filter.slice(1)
          )
        )
      ),
      h.ul(
        { class: "todo-list" },
        ...this.filteredTodos.map((todo) =>
          h.li(
            { class: todo.completed ? "completed" : "" },
            h.input({
              type: "checkbox",
              checked: todo.completed,
              onchange: () => this.toggleTodo(todo.id),
            }),
            h.span({ class: "todo-text" }, todo.text),
            h.button(
              {
                class: "delete-btn",
                onclick: () => this.deleteTodo(todo.id),
              },
              "×"
            )
          )
        )
      )
    );
  }
}

ojs(TodoApp);
```

### Form Validation Example

```javascript
class SignupForm extends Component {
  constructor() {
    super();
    this.formData = state({
      email: "",
      password: "",
      confirmPassword: "",
    });
    this.errors = state({});
    this.isSubmitting = state(false);
  }

  updateField(field, value) {
    this.formData.value = {
      ...this.formData.value,
      [field]: value,
    };
    // Clear error when user types
    this.clearError(field);
  }

  clearError(field) {
    const newErrors = { ...this.errors.value };
    delete newErrors[field];
    this.errors.value = newErrors;
  }

  validate() {
    const errors = {};
    const { email, password, confirmPassword } = this.formData.value;

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    this.errors.value = errors;
    return Object.keys(errors).length === 0;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validate()) return;

    this.isSubmitting.value = true;

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.formData.value),
      });

      if (response.ok) {
        alert("Signup successful!");
        // Reset form
        this.formData.value = { email: "", password: "", confirmPassword: "" };
      } else {
        this.errors.value = { form: "Signup failed. Please try again." };
      }
    } catch (error) {
      this.errors.value = { form: error.message };
    } finally {
      this.isSubmitting.value = false;
    }
  }

  renderField(label, field, type = "text") {
    const error = this.errors.value[field];
    return h.div(
      { class: "form-group" },
      h.label(label),
      h.input({
        type,
        value: this.formData.value[field],
        oninput: (e) => this.updateField(field, e.target.value),
        class: error ? "error" : "",
      }),
      error && h.span({ class: "error-message" }, error)
    );
  }

  render() {
    return h.form(
      { onsubmit: this.handleSubmit.bind(this) },
      h.h2("Sign Up"),
      this.errors.value.form &&
        h.div({ class: "error-banner" }, this.errors.value.form),
      this.renderField("Email", "email", "email"),
      this.renderField("Password", "password", "password"),
      this.renderField("Confirm Password", "confirmPassword", "password"),
      h.button(
        {
          type: "submit",
          disabled: this.isSubmitting.value,
        },
        this.isSubmitting.value ? "Submitting..." : "Sign Up"
      )
    );
  }
}
```

Check the `examples/` directory for more detailed usage patterns:

- **`basic-usage.js`**: Simple counter app
- **`advanced-features.js`**: Fragments and manual context registration
- **`component-example.js`**: Component communication
- **`event-handling.js`**: Mediators and event patterns
- **`state-example.js`**: Deep dive into state patterns
- **`context-state-example.js`**: Global state management

---

## 🛠️ Advanced Topics

### Manual Context Registration

If you need to register a context instance manually (e.g., for testing):

```javascript
import { app } from "modular-openscriptjs";

class MyContext {
  theme = state("dark");
  language = state("en");
}

app("contextProvider").map.set("Theme", new MyContext());
```

### Customizing the Runner

The `ojs()` function is a wrapper around `Runner`. You can use `Runner` directly for more control:

```javascript
import { Runner } from "modular-openscriptjs";

const runner = new Runner();
runner.run(MyComponent);
```

### Fragment Support

Use fragments to return multiple elements without a wrapper:

```javascript
class MyComponent extends Component {
  render() {
    return h.$(
      // or h._
      h.h1("Title"),
      h.p("Paragraph 1"),
      h.p("Paragraph 2")
    );
  }
}
```

### Lazy Loading Components

```javascript
import { app } from "modular-openscriptjs";

const loader = app("loader");

// Lazy load a component
const LazyComponent = await loader.req("components.LazyComponent");
```

---

## 🔧 Configuration

### Vite Plugin

For production builds with proper minification:

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

### TypeScript Support

While OpenScript is written in vanilla JavaScript, it works well with TypeScript:

```typescript
import { Component, app, state, State } from "modular-openscriptjs";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoList extends Component {
  todos: State<Todo[]>;

  constructor() {
    super();
    this.todos = state<Todo[]>([]);
  }

  // ... rest of implementation
}
```

---

## 📈 Best Practices

### State Management

- ✅ Use contexts for truly global state
- ✅ Keep component state local when possible
- ✅ Use computed properties (getters) for derived state
- ❌ Don't mutate state directly, always reassign

### Component Design

- ✅ Keep components small and focused
- ✅ Use functional components for presentational UI
- ✅ Leverage lifecycle hooks appropriately
- ❌ Don't mix business logic with UI logic

### Event System

- ✅ Use mediators for business logic
- ✅ Keep event names well-organized
- ✅ Document your event structure
- ❌ Don't emit events in tight loops

### Performance

- ✅ Use `resetParent` to clear before rendering
- ✅ Minimize state updates
- ✅ Use fragments to avoid unnecessary wrapper elements
- ❌ Don't create new functions in render (use component methods)

---

## 🐛 Troubleshooting

### Component Not Re-rendering

- Ensure state is updated via `.value` assignment
- Check that state is actually being used in `render()`
- Verify component is properly mounted

### Events Not Firing

- Confirm events are registered with broker
- Check event names match exactly (remember the namespace)
- Ensure mediators are instantiated

### Router Not Working

- Call `router.listen()` after defining routes
- Check browser console for errors
- Verify route paths are correct

---

## 📄 License

MIT © Levi Kamara Zwannah

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/modular-openscriptjs)
- [Issue Tracker](https://github.com/yourusername/modular-openscriptjs/issues)
- [npm Package](https://www.npmjs.com/package/modular-openscriptjs)
- [Documentation](https://github.com/yourusername/modular-openscriptjs/wiki)

---

**Built with ❤️ using OpenScript**
