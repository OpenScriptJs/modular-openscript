# Components

Components are the building blocks of an OpenScript application. They encapsulate the UI and logic for a specific part of your application.

There are two primary ways to create components: **Class Components** and **Functional Components**.

## Class Components

Class components are the most feature-rich way to define components. They extend the `Component` class provided by `modular-openscriptjs`.

### Basic Structure

```javascript
import { Component, app, ojs, state } from "modular-openscriptjs";

const h = app("h");

export default class MyComponent extends Component {
  constructor() {
    super();
    // Initialize state
    this.counter = state(0);
  }

  render(...args) {
    return h.div(
      h.h1("My Component"),
      h.p(`Count: ${this.counter.value}`),
      ...args,
    );
  }
}

// Register the component
ojs(MyComponent);
```

### Key Features

1.  **Extends `Component`**: Must extend the base class.
2.  **`render()` Method**: Must implement a `render` method that returns the markup (usually via `h` instance).
3.  **State Management**: Can hold local state using `state()`.
4.  **`ojs(MyComponent)`**: Registers the component with the framework.
5.  **Passing Arguments**: The `render` method receives `...args` which can contain parent elements, attributes, or other data passed during rendering. Always spread `...args` in your root element or handle them appropriately.

## Functional Components

Functional components are simpler and are best used for presentational components that don't require complex state management or lifecycle hooks.

### Basic Structure

```javascript
import { app } from "modular-openscriptjs";

const h = app("h");

export default function MyFunctionalComponent(props = {}) {
  return h.div(
    { class: "card" },
    h.h2(props.title || "Default Title"),
    h.p(props.content),
  );
}
```

_Note: Functional components are just regular JavaScript functions that return valid OpenScript markup._

## Naming Conventions

- **Capitalized Names**: Component names (both class and function) **MUST** start with a Capital letter (e.g., `MyComponent`, `UserProfile`).
- **Kebab-case in DOM**: When rendered, OpenScript converts the class name to kebab-case for the custom element tag (e.g., `MyComponent` -> `<ojs-my-component>`).

## Event Listening

OpenScript provides a declarative way to listen to events on elements.

### Using `listeners` Object

When creating an element with `h`, you can pass a `listeners` object in the attributes.

```javascript
h.button(
  {
    class: "btn",
    listeners: {
      click: this.handleClick.bind(this),
      mouseover: (e) => console.log("Hovered", e),
    },
  },
  "Click Me",
);
```

### Method Binding

For class components, it's common to define methods for event handlers. Remember to `.bind(this)` or use arrow functions to preserve the correct `this` context.

```javascript
export default class Counter extends Component {
  // ...

  increment() {
    this.count.value++;
  }

  render() {
    return h.button(
      {
        listeners: {
          click: this.increment.bind(this), // Binding is crucial
        },
      },
      "+",
    );
  }
}
```

### Special Event Methods

If your component class defines methods starting with `$_`, OpenScript automatically treats them as event listeners for the component instance itself (lifecycle events).

- `$_mounted()`: Called when the component is added to the DOM.
- `$_rendered()`: Called when the component is rendered.
