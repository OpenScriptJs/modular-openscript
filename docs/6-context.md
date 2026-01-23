# Context & State Utilities

Context in OpenScript is a mechanism to share state and data across decoupled components and mediators without prop drilling. It acts as a shared object for storing application state.

## Concept

A **Context** is essentially a shared object (instance of `Context` class) that holds `State` instances or other data. It allows:

- **Decoupling**: Mediators can update context, and Components can read/listen to it without knowing about each other.
- **Shared Data**: accessible via `context('ContextName')`.

## Defining & Loading Contexts

You do **not** need to define a special class for your context. You simply register it using `putContext`.

```javascript
// contexts.js
import { putContext, context, app } from "modular-openscriptjs";

// Register a context named "global"
// The second argument is a label/path for debugging or loading structure
putContext(["global"], "AppContext");

// Export for usage
export const gc = context("global");

// Initialize States in Setup
export function setupContexts() {
  gc.states({
    appName: "My App",
    isLoggedIn: false,
    user: null,
  });

  // Register in Container (optional but recommended)
  app.value("gc", gc);
}
```

## Using Context

### Accessing Context

Use the `context()` helper to retrieve a loaded context.

```javascript
import { context } from "modular-openscriptjs";

const gc = context("global");
```

### Bulk State Initialization

The `Context` instance has a helper method `states()` to initialize multiple states at once.

```javascript
// Initialize multiple states
gc.states({
  isLoading: true,
  data: [],
  error: null,
});
```

## Best Practices

### Context vs Component State

- **Context**: Use for global data (User session, Theme, Shopping Cart) or data shared between broad sections of the app.
- **Component State**: Use for local UI behavior (Modal open/close, Form input temporary values).

### Handling Large Lists

> [!WARNING]
> **Do not store massive arrays in Context State** if they are only for display (e.g., Infinite Scroll data).

For large datasets:

1.  **Do not put them in a reactive state**.
2.  **Mediators** should handle fetching and posting data.
3.  **Components** should perform "GET" operations to retrieve this data directly (or through a non-reactive service) when needed, rather than listing to a state that holds 1000s of objects.
4.  Use methods like `replaceParent` or specialized logic to append DOM nodes efficiently instead of re-rendering the entire list via state change.
