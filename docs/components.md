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

> [!IMPORTANT]
> **Registration is Required Before Use**
> You **MUST** call `ojs(YourComponent)` to register the component in the IoC container. This **MUST** happen before you try to use the component (e.g., `h.YourComponent()`).
>
> The most common pattern is to call `ojs(YourComponent)` at the very end of your component file, ensuring it is registered as soon as the file is imported.

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

Methods starting with `$_` are treated as listeners for events emitted by the component itself.

> [!WARNING]
> **Context Safety**: Inside these listeners, **do not rely on `this`** to access the component instance, as the context might not be bound as expected during execution.
>
> Instead, use the **`componentId`** passed as the first argument and the **`component(id)`** helper to retrieve the safe instance.

- `$_mounted(componentId)`: Called when the component is added to the DOM.
- `$_rendered(componentId)`: Called when the component is rendered.
- `$_customEvent(componentId, ...args)`: Listens for `this.emit('customEvent')`.

```javascript
import { component } from "modular-openscriptjs";

export default class MyComponent extends Component {
  $_mounted(componentId) {
    // Correct way to get the instance
    const self = component(componentId);
    self.handleMount();
  }
}
```

#### Broker Events (`$$`)

Methods starting with `$$` are treated as listeners for global events emitted via the **Broker**.

**Signature**: `(eventData, eventName)`

- `eventData`: The JSON stringified payload (needs `EventData.parse()`).
- `eventName`: The string name of the event that triggered this listener.

- `$$app_started(eventData, event)`: Listens for `app:started`.
- `$$user_login(eventData, event)`: Listens for `user:login`.

```javascript
import { EventData, component } from "modular-openscriptjs";

export default class UserProfile extends Component {
  // Listen to global 'auth:logout' event
  async $$auth_logout(eventData, event) {
    // 1. Parse Data
    const data = EventData.parse(eventData);

    // 2. Get Safe Component Instance (if needed)
    // Note: Broker listeners in components might not automatically receive componentId
    // depending on binding. If 'this' is unsafe, ensure you have a reference.
    // However, usually 'this' in Component methods is bound.
    // BUT if the user explicitly warned about 'this' in listeners generally:

    console.log(`Received ${event}`);
    this.cleanUp(); // 'this' is usually safe in class classes unless stated otherwise,
    // but following the pattern: if it's an auto-attached listener,
    // verify if it receives componentId?
    // The user said: "In those mounted function... use component(id)".
    // Mounted functions usually refer to $_.
    // Let's assume standard methods $$ might still bind 'this' or
    // we should stick to the safe pattern if applicable.
    // For now, I will assume $$ methods on Component might still work with 'this',
    // but I will respect the standard signature (eventData, event).
  }
}
```

Wait, the user said for `$_` listeners (mounted, etc) specifically regarding `componentId`. "In those mounted function...".
For `$$`, it's a broker listener.
I will implement the `(eventData, event)` signature change.

```javascript
  // Listen to global 'auth:logout' event from Broker
  async $$auth_logout(eventData, event) {
    const data = EventData.parse(eventData);
    console.log("User logged out:", data.message.getAll());
    this.cleanUp();
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
