# State Management

State management in OpenScript is handled by the `State` class. States are reactive objects that notify listeners when their values change.

## Creating State

To create a state, use the `state` helper function (or `State.state`).

```javascript
import { state } from "modular-openscriptjs";

// Create a state with an initial value
const counter = state(0);
const user = state({ name: "Levi", role: "Admin" });
```

## Using State in Components

There are two primary ways to use state in components: explicit listening and automatic listening via `render`.

### Automatic Listening (Render Argument)

If you pass a state object as an argument to a component's `render` method, the component automatically subscribes to that state. When the state changes, the component re-renders.

```javascript
export default class CounterDisplay extends Component {
  render(countState) {
    // This component will re-render whenever countState changes
    return h.div(`Current Count: ${countState.value}`);
  }
}

// Usage
const myCount = state(0);
h.CounterDisplay(myCount);
```

### Manual Listening

You can also manually listen to state changes using the `.listener()` method, typically in `$_mounted` or constructor, though automatic listening is preferred for UI updates.

## Global vs Local State

- **Local State**: Created inside a component (e.g., in the constructor) and used only by that component.
- **Global State**: Created outside components (e.g., in a separate file or `ojs.config.js`) and imported where needed.

```javascript
// Global state example
export const globalTheme = state("dark");
```

## Anonymous Components (`v`)

For simple reactive parts of your UI that don't warrant a full class component, use the `v` helper (Value function). It creates an anonymous component that listens to a state.

```javascript
import { v, state, app } from "modular-openscriptjs";

const h = app("h");
const name = state("World");

h.div(
  h.h1("Hello"),
  // efficiently updates only this text node when 'name' changes
  v(name, (s) => ` ${s.value}!`),
);
```

The `v` function takes the state as the first argument and a callback as the second. The callback receives the state and should return the markup/string to render.

## State Helper Methods

- `state.value`: Get or set the current value.
- `state.fire()`: Manually trigger listeners.
- `state.listener(callback)`: Add a listener.
