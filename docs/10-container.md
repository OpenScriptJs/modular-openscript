# IoC Container & `app()` Service

OpenScript uses an **Inversion of Control (IoC) Container** to manage dependencies and global services. This promotes loose coupling and makes your application easier to test and maintain.

## The `app()` Helper

The most common way to interact with the container is via the `app()` helper function.

### Accessing Services

You can retrieve any registered service by passing its name to `app()`.

```javascript
import { app } from "modular-openscriptjs";

// Get the Router instance
const router = app("router");

// Get the Broker
const broker = app("broker");

// Get a context (if registered)
const globalContext = app("gc");
```

### Accessing the Container

Calling `app()` without arguments returns the **Container** instance itself. This is useful when you need to register new services or values.

```javascript
const container = app();

// Register a new value
container.value("myConfig", { apiKey: "12345" });
```

## Registering Services

You typically register services in your `ojs.config.js` or a setup file.

### `container.value(name, value)`

Registers a constant value or an existing instance. This is the most common method for configuration or pre-instantiated classes.

```javascript
import { app } from "modular-openscriptjs";
import { appEvents } from "./events.js";

// Registering appEvents so it can be resolved anywhere
app().value("appEvents", appEvents);
```

### `container.singleton(name, Class, dependencies)`

Registers a class as a singleton. The container will create **one** instance the first time it is resolved and return that same instance forever.

```javascript
// Register API Service
app().singleton("api", ApiService);

// Later...
const api = app("api"); // Creates instance
const api2 = app("api"); // Returns same instance
```

### `container.transient(name, Class, dependencies)`

Registers a class as transient. The container will create a **new** instance every time it is resolved.

```javascript
app().transient("logger", Logger);
```

### `container.factory(name, factoryFunction)`

Registers a factory function. The function is called to produce the value.

```javascript
app().factory("timestamp", () => Date.now());
```

## Resolving Services

While `app('name')` is the shortcut, you can also use `container.resolve('name')`.

```javascript
const myService = app().resolve("myService", "defaultValue");
```

### Dependency Injection

When defining services that depend on others, you can pass an array of dependency names.

```javascript
class UserService {
  constructor(api, broker) {
    this.api = api;
    this.broker = broker;
  }
}

// Register UserService with dependencies 'api' and 'broker'
app().singleton("userService", UserService, ["api", "broker"]);

// When resolving, container auto-injects "api" and "broker"
const userService = app("userService");
```

## Core Services

The following services are registered by default:

- `"h"`: The Markup Engine (Proxy)
- `"router"`: The Router instance
- `"broker"`: The Event Broker
- `"repository"`: Internal Component Repository
- `"contextProvider"`: The Context Provider
