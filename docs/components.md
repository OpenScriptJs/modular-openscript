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

> [!TIP]
> It is recommended to use **anonymous functions** for listeners to avoid potential memory leaks associated with direct binding. While OpenScript is generally memory-safe, using anonymous functions ensures that references are properly managed and collected.

```javascript
h.button(
  {
    class: "btn",
    listeners: {
      // Preferred: Anonymous function
      click: (e) => this.handleClick(e),

      // Also safe: Arrow functions defined inline
      mouseover: (e) => console.log("Hovered", e),
    },
  },
  "Click Me",
);
```

### Method Binding

While you can bind methods directly, be aware that creating new bound functions (e.g., `.bind(this)`) on every render can potentially lead to memory overhead if not handled correctly by the garbage collector.

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
          // Anonymous function wrapper is preferred over .bind(this)
          click: () => this.increment(),
        },
      },
      "+",
    );
  }
}
```

### Special Event Methods

OpenScript provides conventions for automatically listening to events based on method names.

#### Component Lifecycle & Emitted Events (`$_`)

Methods starting with `$_` are treated as listeners for events emitted by the component itself (including lifecycle events).

- `$_mounted()`: Called when the component is added to the DOM.
- `$_rendered()`: Called when the component is rendered.
- `$_customEvent()`: Listens for `this.emit('customEvent')`.

#### Broker Events (`$$`)

Methods starting with `$$` are treated as listeners for global events emitted via the **Broker**.

- `$$app_started()`: Listens for `app:started` event (dots/colons usually mapped to underscores).
- `$$user_login()`: Listens for `user:login` event.

```javascript
export default class UserProfile extends Component {
  // Listen to component's own mount event
  $_mounted() {
    console.log("UserProfile mounted");
  }

  // Listen to global 'auth:logout' event from Broker
  $$auth_logout(user) {
    console.log("User logged out:", user);
    this.cleanUp();
  }
}
```

### Inline Attribute Listeners

For inline event attributes (like `onclick`, `onchange`, etc.) that mimic standard HTML attributes, you can use `this.method('methodName', ...args)`. This approach allows you to reference component methods directly in the string attribute, which is useful when standard `listeners` object binding isn't applicable or preferred for specific attribute-based APIs.

```javascript
export default class MyComponent extends Component {
  greet(name) {
    alert(`Hello, ${name}!`);
  }

  render() {
    // Uses this.method to create a reference to the 'greet' method
    // 'onclick' here is treated as an attribute, not a direct event listener attachment
    return h.button(
      {
        onclick: this.method("greet", "Levi"), // effectively onclick="...greet('Levi')"
      },
      "Say Hello",
    );
  }
}
```

_Note: `this.method()` is specifically for attributes that expect a string script (like `onclick` in HTML), bridging them back to your component's methods._
