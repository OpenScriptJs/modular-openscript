# OpenScript Markup (OSM)

OpenScript Markup (OSM) is a powerful, JavaScript-based Domain Specific Language (DSL) for generating HTML. It uses the `h` object, a proxy that translates methods into HTML elements.

## Basic Syntax

To use OSM, you need to import the `app` instance and retrieve the `h` service.

```javascript
import { app } from "modular-openscriptjs";

const h = app("h");

// Simple element
const div = h.div("Hello World");
// Output: <div>Hello World</div>
```

### How it Works

The `h` object is a **Proxy**. When you access a property on it (e.g., `h.div`, `h.span`, `h.customElement`), it returns a function that generates an element with that tag name.

> **Note**: OSM supports all standard HTML tags (`h.section`, `h.a`, `h.img`) and custom elements (`h.myComponent`).

## Attributes & Properties

Attributes can be passed as **objects** at any point in the argument list. OpenScript treats any argument that is an object (and not a DOM Node or State) as an attributes object.

```javascript
// Attributes can be anywhere
h.div("Text first", { id: "my-div" }, " More text");

// Multiple attributes objects are merged
// Note: Underscores in keys are converted to dashes (data_role -> data-role)
h.div({ id: "main" }, "Content", { data_role: "wrapper" });
```

### Class Merging

Special attributes like `class` are intelligently handled. If you pass multiple class attributes (in different objects), they are **concatenated** rather than overwritten.

```javascript
h.div({ class: "btn" }, "Click Me", { class: "btn-primary" });
// Output: <div class="btn btn-primary">Click Me</div>
```

### Event Handling & Memory Safety

> [!WARNING]
> **Avoid `addEventListener`**: Do not use the standard `element.addEventListener` methods on nodes created by OpenScript. Doing so can lead to memory leaks because the framework cannot track and automatically remove these listeners when the component is unmounted.

Instead, always use the `listeners` attribute object. OpenScript modifies the DOM nodes to include safe `addListener` and `removeListener` methods that integrate with the framework's lifecycle management.

```javascript
h.button(
  {
    listeners: {
      click: (e) => console.log("Safe click", e),
    },
  },
  "Safe Button",
);
```

### Extending Node Functionality (`methods`)

You can attach custom methods to a DOM node at runtime using the `methods` attribute. This is useful for exposing logic that needs to be called externally (e.g., after retrieving the node via `document.getElementById`).

```javascript
h.div(
  {
    id: "my-widget",
    methods: {
      refresh: function () {
        this.innerHTML = "Refreshed!"; // 'this' refers to the DOM element
      },
      getData: () => ({ id: 1, value: "test" }),
    },
  },
  "Widget Content",
);

// Usage elsewhere:
const widget = document.getElementById("my-widget");
if (widget) {
  widget.methods().refresh();
}
```

### Inline Function Calls (`h.func`)

The `h.func` helper formats a function and its arguments as a string, suitable for placement in inline event attributes (like `onclick`). This is how you pass function calls into string-based attributes.

```javascript
// In a component
render() {
  return h.div({
    // Generates: onclick="greet('Levi', 42)"
    onclick: h.func("greet", "Levi", 42)
  }, "Click to Greet")
}
```

### Boolean Attributes

Boolean attributes work as expected:

```javascript
h.input({ type: "checkbox", checked: true, disabled: false });
```

### Style Object

You can pass a style string directly:

```javascript
h.div({ style: "color: red; font-weight: bold;" }, "Styled Text");
```

## Children & Text Content

Arguments after the attributes (or the first argument if it's not an attributes object) are treated as children.

```javascript
h.ul(
  { class: "list" },
  h.li("Item 1"),
  h.li("Item 2"),
  h.li(h.strong("Item 3 with bold text")),
);
```

### Text Nodes

Strings and numbers are automatically converted to text nodes.

```javascript
h.p("You have ", 5, " notifications.");
```

## Logic & Helpers

OpenScript provides helper functions to handle logic like iterations and conditionals directly within your markup structure.

### Executing Logic (`h.call`)

If you need to run arbitrary logic during the creation of the node structure, you can use `h.call(callback)`. The callback should return a valid OSM node (string, element, or array).

```javascript
h.div(
  { class: "container" },
  h.call(() => {
    // Perform complex logic here
    const date = new Date();
    return h.span(`Created at: ${date.toLocaleTimeString()}`);
  }),
);
```

### Iteration (`each`)

The `each` helper iterates over an array or object and returns an array of results.

```javascript
import { app, each } from "modular-openscriptjs";

const items = ["Apple", "Banana", "Cherry"];

h.ul(
  each(items, (item, index) => {
    return h.li({ "data-index": index }, item);
  }),
);
```

### Conditionals (`ifElse`)

The `ifElse` helper (or `Utils.ifElse`) allows you to conditionally render content.

```javascript
import { app, ifElse } from "modular-openscriptjs";

const isLoggedIn = true;

h.div(
  ifElse(
    isLoggedIn,
    () => h.button("Logout"), // True branch (function executed)
    h.button("Login"), // False branch (value returned)
  ),
);
```

## Fragments (`h.$` or `h._`)

Fragments allow you to group multiple elements without adding an extra node to the DOM. This is particularly useful when returning multiple root elements from a component or `h.call`.

To create a fragment, use `h.$()` or `h._()`.

> [!IMPORTANT]
> **Single Root Requirement**: Even within a fragment, you must ensure there is a **single top-level element** that acts as the parent for the other elements in that fragment structure.

```javascript
// Correct Usage
h.$(
  h.div(
    // Top-level parent in the fragment
    h.span("Part 1"),
    h.span("Part 2"),
  ),
);

// Incorrect Usage (Multiple top-level siblings)
// h.$ (
//   h.div("Part 1"),
//   h.div("Part 2")
// )
```

### Component Wrapper Behavior

Normally, a Component's markup is automatically wrapped in a custom element (e.g., `<ojs-my-component>`). However, **if a component returns a fragment**, this wrapper is **NOT** created.

> [!CAUTION]
> **State Reactivity Limitation**: Components that return fragments **cannot react to state changes** efficiently because there is no wrapper element to anchor the reconciler. Use fragments in components primarily for splitting up large render functions or for static content.
>
> **Top-Level Requirement**: While fragments avoid wrappers, your final application structure **Must** typically have a stable top-level element in the final markup for the framework to attach to.
