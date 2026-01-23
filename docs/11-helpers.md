# Helper Functions

OpenScript provides a set of global helper functions and utilities to simplify common tasks, DOM manipulation, and framework interaction.

## Logic Helpers

These helpers are available globally (e.g., `window.ifElse`) and can be used directly in your code or templates.

### `ifElse(condition, trueValue, falseValue)`

Evaluates a condition and returns one of two values. If the values are functions, they are executed.

```javascript
// Basic usage
const status = ifElse(isOnline, "Online", "Offline");

// With functions (lazy evaluation)
const result = ifElse(
  isValid,
  () => complexCalculation(),
  () => "Invalid",
);
```

### `coalesce(value1, value2)`

Returns the first non-null/undefined value. Handy for defaults.

```javascript
const name = coalesce(userInput, "Guest");
```

### `each(iterable, callback)`

Safely iterates over arrays or objects. Returns an array of results.

```javascript
// Array
each([1, 2, 3], (num) => console.log(num));

// Object
each({ a: 1, b: 2 }, (val, key) => console.log(key, val));
```

### `lazyFor(array, callback)`

Iterates over an array asynchronously using `setTimeout(..., 0)` to avoid blocking the main thread during large operations.

```javascript
lazyFor(hugeArray, (item) => {
  // Process item without freezing UI
});
```

---

## DOM Utilities (`dom`)

The `dom` object provides shortcuts for common DOM operations.

### Selection

- **`dom.id(id)`**: wrapper for `document.getElementById`.
- **`dom.get(selector, parent?)`**: wrapper for `querySelector`.
- **`dom.all(selector, parent?)`**: wrapper for `querySelectorAll`.
- **`dom.byClass(className, parent?)`**: wrapper for `getElementsByClassName`.

### Manipulation

- **`dom.create(type)`**: wrapper for `document.createElement`.
- **`dom.put(html, element, append = false)`**: Sets `innerHTML`.
- **`dom.clear(element)`**: Clears `innerHTML`.
- **`dom.disable(element)` / `dom.enable(element)`**: Toggles `disabled` attribute.

### Positioning

- **`dom.centerInside(container, element)`**: Centers an absolutely positioned element within a container.

---

## Framework Helpers

### `app(serviceName?)`

Access the IoC Container.

- `app("router")`: Get Router.
- `app("broker")`: Get Event Broker.
- `app()`: Get the Container instance itself.

### `component(id)`

Retrieves a Component instance by its unique ID (UID).
Useful in event listeners where you have the UID but not the instance.

```javascript
const myComp = component(123);
myComp?.setState(newState);
```

### `context(name)` & `putContext(name, value)`

Shortcuts for the Context API.

- `context("theme")`: Get the "theme" context.
- `putContext("theme", "dark")`: Define/Update the "theme" context.

### `state(initialValue)`

Creates a new State object.

```javascript
const count = state(0);
```

### `v(state, callback)`

Creates an "Anonymous Component" that updates when the bound state changes.

```javascript
// Renders text that updates automatically
h.div(
  {},
  v(countState, (val) => `Count is: ${val}`),
);
```

### `ojs(...classes)`

The main entry point to run the application runner.

```javascript
ojs(AppClass);
```
