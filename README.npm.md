# OpenScriptJs

[![npm version](https://badge.fury.io/js/modular-openscriptjs.svg)](https://www.npmjs.com/package/modular-openscriptjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, reactive JavaScript framework for building modern web applications with components, state management, routing, and event-driven architecture.

## ✨ Features

- ⚡️ **Reactive State Management** - Built-in reactive state with automatic component re-rendering
- 🧩 **Component-Based** - Modular, reusable components with declarative markup
- 🔄 **Routing** - Fluent client-side router API
- 📡 **Event System** - Broker pattern for decoupled component communication
- 🎯 **Mediators** - Centralized business logic handlers
- 🎨 **TailwindCSS Ready** - First-class Tailwind integration
- 🛠️ **Build Tools** - Vite plugin for minification-safe builds
- 📦 **Zero Dependencies** - Core framework has no runtime dependencies

## 🚀 Quick Start

### Installation

````bash
- `basic` - Clean starter with vanilla CSS
- `tailwind` - Pre-configured with TailwindCSS

## 📖 Basic Usage

```javascript
import { Component, app, state } from "modular-openscriptjs";

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
      h.button(
        {
          listeners: { click: this.increment.bind(this) },
        },
        "Increment"
      )
    );
  }
}

// Mount and render
const counter = new Counter();
await counter.mount();
h.Counter({ parent: document.body });
````

## 🏗️ Project Structure

```
my-app/
├── src/
│   ├── components/     # Your components
│   ├── main.js         # Entry point
│   └── style.css       # Styles
├── index.html
├── vite.config.js
└── package.json
```

## 📚 Core Concepts

### Components

```javascript
import { Component, app } from "modular-openscriptjs";

const h = app("h");

class MyComponent extends Component {
  render(...args) {
    return h.div({ class: "container" }, h.h1("Hello OpenScript!"), ...args);
  }
}
```

### State Management

```javascript
import { state } from "modular-openscriptjs";

// Create reactive state
const count = state(0);

// Update triggers re-render
count.value = 10;

// Listen to changes
count.listener((s) => console.log("New value:", s.value));
```

### Routing

```javascript
import { app } from "modular-openscriptjs";

const router = app("router");
const h = app("h");

router.on("/home", () => {
  h.HomePage({ parent: document.body, resetParent: true });
});

router.on("/about", () => {
  h.AboutPage({ parent: document.body, resetParent: true });
});

router.listen();
```

### Context & Global State

```javascript
import { context, putContext, app } from "modular-openscriptjs";

const h = app("h");

// Register contexts
putContext(["global", "user"], "AppContext");

const gc = context("global");

// Initialize states
gc.states({
  appName: "My App",
  theme: "light",
});

// Pass to components
h.MyComponent(gc.appName, { parent: document.body });
```

## 🎨 TailwindCSS Integration

OpenScript works seamlessly with Tailwind:

```javascript
import { app } from "modular-openscriptjs";

const h = app("h");

h.div(
  { class: "bg-blue-500 text-white p-4 rounded-lg" },
  h.h1({ class: "text-2xl font-bold" }, "Styled with Tailwind")
);
```

See [Tailwind Integration Guide](./docs/TAILWIND_INTEGRATION.md) for details.

## 🔧 Building Your App

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## 📦 Using the Vite Plugin

For proper minification handling:

```javascript
// vite.config.js
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default {
  plugins: [openScriptComponentPlugin()],
};
```

This ensures component names survive minification.

## 📘 Documentation

- [Full Documentation](./README.md)
- [API Reference](./docs/)
- [Examples](./examples/)
- [Tailwind Integration](./docs/TAILWIND_INTEGRATION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Levi Kamara Zwannah

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/modular-openscriptjs)
- [Issue Tracker](https://github.com/yourusername/modular-openscriptjs/issues)
- [npm Package](https://www.npmjs.com/package/modular-openscriptjs)

---

Built with ❤️ using OpenScript
