# Events & Broker

OpenScript uses a **Broker** to manage communication between components and mediators. This decoupled architecture relies on a structured event system.

## Event Structure & Registration

Events are typically defined as a structured "fact" object in `events.js`. This structure allows you to use auto-completion and compile-time checking for event names.

When you register this object with the broker using `broker.registerEvents(appEvents)`, OpenScript parses it and replaces the leaf values (set to `true`) with the actual namespaced event string.

```javascript
// events.js (Before Registration)
export const appEvents = {
  auth: {
    login: true, // Becomes "auth:login"
    logout: true, // Becomes "auth:logout"
  },
  user: {
    is: {
      authenticated: true, // Becomes "user:is:authenticated"
    },
  },
};
```

### Registration (ojs.config.js)

```javascript
import { appEvents } from "./events.js";

// ... in configureApp()
broker.registerEvents(appEvents);
container.value("appEvents", appEvents);
```

## Using Object Paths

After registration, you can use the `appEvents` object keys to reference the event strings directly. This prevents typo-related bugs.

```javascript
// Instead of this:
this.send("auth:login", data);

// Use this:
this.send(appEvents.auth.login, data);
```

## Payloads (`payload` / `EventData`)

When sending events, it is best practice to wrap your data in a standard **Payload**. OpenScript provides a `payload` or `eData` helper for this.

A payload consists of:

- **Message**: The actual data (body).
- **Meta**: Metadata about the event (timestamps, source, etc).

```javascript
import { payload } from "modular-openscriptjs";

// Sending an event with a payload
this.send(
  appEvents.auth.login,
  payload(
    { username: "Levi", id: 1 }, // Message
    { timestamp: Date.now() }, // Meta (optional)
  ),
);
```

### Receiving Payloads

Listeners created with `$$` (or standard broker listeners) receive these arguments.

```javascript
async $$auth_login(eventData, event) {
  // eventData is the JSON string payload
  // event is the specific event string that triggered this listener
}
```

> **Note**: `EventData` is the underlying class, but `payload()` is the convenient helper function to create instances of it.

## Parsing Received Events

When an event is received (e.g., in a Mediator), the payload is often a **JSON string**. You must parse it back into an `EventData` object to access the helpers.

```javascript
import { EventData } from "modular-openscriptjs";

// ... in a listener
const eventData = EventData.parse(payloadString);
```

### EventData Helper Methods

The parsed object provides `message` and `meta` properties, each with the following methods:

- `has(key)`: Checks if a key exists.
- `get(key, defaultValue)`: Gets a value (returns `defaultValue` if missing).
- `put(key, value)`: Sets a value.
- `remove(key)`: Deletes a value.
- `getAll()`: Returns the raw object.

```javascript
const userId = eventData.message.get("id");
if (eventData.meta.has("timestamp")) {
  // ...
}
```
