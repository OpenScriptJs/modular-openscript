# Mediators

Mediators act as the bridge between your application's logic (backend/services) and the frontend (components). They facilitate a clean separation of concerns by handling business logic and communicating via the unrelated **Broker**.

## Concept & Role

Mediators are **stateless** classes that listen for events, execute logic (like API calls or data processing), and then potentially emit new events. They do not manipulate the DOM directly.

```javascript
// AuthMediator.js
export default class AuthMediator extends Mediator {
  shouldRegister() {
    return true;
  }
}
```

### Best Practice: `boot.js`

For Mediators, it is best practice to have a dedicated `boot.js` (or `mediators.js`) file that imports and registers them all. This ensures they are registered early in the application lifecycle.

```javascript
// src/boot.js
import { ojs } from "modular-openscriptjs";
import AuthMediator from "./mediators/AuthMediator";
import CartMediator from "./mediators/CartMediator";

export default function boot() {
  ojs(AuthMediator, CartMediator);
}
```

Then, in your `main.js`:

```javascript
// src/main.js
import boot from "./boot";

boot(); // Registers all mediators
```

## Broker Registration

When you define a Mediator, it is automatically registered with the **Broker** if `shouldRegister()` returns `true`. The broker scans the mediator for special properties to set up event listeners.

## Event Listening (`$$`)

The `$$` prefix is used to define event listeners. OpenScript interprets these property names and values to decide which events to listen to.

### Underscore means "OR"

If you use an underscore in the method name after `$$`, it acts as an **OR** operator. The method will key off **multiple independent events**.

```javascript
import { EventData } from "modular-openscriptjs";

/*
 * Listens for:
 * - 'user' event
 * - 'login' event
 * (NOT 'user:login')
 */
async $$user_login(eventData, event) {
  // Parse the JSON string payload
  const data = EventData.parse(eventData);

  console.log(`Triggered by '${event}'`);
  console.log("User ID:", data.message.get("id"));
}
```

### Namespacing (Nested Objects)

To listen to namespaced events (e.g., `user:login`, `user:logout`), you should use **nested objects**. This structure treats events as facts and allows for organized event definitions.

```javascript
// Property starts with $$ -> 'auth' namespace
$$auth = {
  // Listens for 'auth:login'
  login: async (eventData, event) => {
    const data = EventData.parse(eventData);
    this.handleLogin(data);
  },

  // Listens for 'auth:logout'
  logout: async (eventData, event) => {
    this.handleLogout();
  },

  // Nested further: 'auth:password:reset'
  password: {
    reset: (email) => { ... }
  }
}
```

## Creating "Events as Facts"

It is a best practice to structure your events like facts (`noun:verb` or `subject:predicate:object`). This is typically done in `events.js` and enforced by `broker.requireEventsRegistration(true)`.

```javascript
// appEvents definition (events.js)
export const appEvents = {
  user: {
    is: {
      authenticated: true, // event: 'user:is:authenticated'
      unauthenticated: true,
    },
    has: {
      ordered: true, // event: 'user:has:ordered'
    },
  },
};
```

## Sending Events

Mediators can send events using `this.send(event, payload(...))` or `this.broadcast(event, payload(...))`.

```javascript
import { payload } from "modular-openscriptjs";

// listen to auth and login events
async $$auth_login(eventData, event) {
  // Validate...
  this.send(
      "user:is:authenticated",
      payload({ userProfile })
  );
}
```
