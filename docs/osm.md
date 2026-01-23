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

You can pass attributes as the first argument to the tag function if it is an object (and not a DOM node or State).

```javascript
h.a(
  {
    href: "https://example.com",
    class: "link primary",
    target: "_blank",
    id: "main-link",
  },
  "Visit Example",
);
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
