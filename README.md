# Modular OpenScript Framework

This is a modularized version of the OpenScript framework, designed to be more maintainable, testable, and scalable.

## Installation

You can import the modules directly into your project.

```javascript
import { Component, h, Runner } from './path/to/modular-openscript/index.js';
```

## Quick Start

See [`examples/full-application.js`](./examples/full-application.js) for a complete real-world example.

```javascript
import { Component, Mediator, h, broker, context, putContext, state, router } from './modular-openscript/index.js';

// 1. Register events
const $e = {
    user: { authenticated: true, loggedOut: true }
};
broker.registerEvents($e);

// 2. Initialize context
putContext("user", "UserContext");
const uc = context("user");
uc.states({ isLoggedIn: false });

// 3. Create a component
class Dashboard extends Component {
    render(...args) {
        return h.div("Welcome to OpenScript!", ...args);
    }
}

// 4. Mount to DOM
const dashboard = new Dashboard();
dashboard.mount(document.getElementById("app"));
```

## Core Concepts

### Component

Components are the building blocks of your UI. They extend the `Component` class.

```javascript
import { Component, h } from './modular-openscript/index.js';

class MyComponent extends Component {
    render(...args) {
        return h.div('Hello World', ...args);
    }
}
```

### Runner

The `Runner` class is used to initialize and mount your components.

```javascript
import { Runner } from './modular-openscript/index.js';
import MyComponent from './MyComponent.js';

new Runner().run(MyComponent);
```

### State

State management is handled by the `State` class.

```javascript
import { State } from './modular-openscript/index.js';

const myState = State.state(0);

myState.value++; // Triggers updates
```

### Router

Client-side routing is managed by the `Router` class.

```javascript
import { router } from './modular-openscript/index.js';

router.on('home', () => {
    console.log('Home page');
});

router.listen();
```

### Broker

The `Broker` acts as a central event bus.

```javascript
import { broker } from './modular-openscript/index.js';

broker.on('my-event', (data) => {
    console.log(data);
});

broker.emit('my-event', { some: 'data' });
```


## Advanced Features

### Fragments
Use `h.$` or `h._` to create document fragments, allowing you to return multiple elements without a parent wrapper.

```javascript
import { Component, h } from './modular-openscript/index.js';

class FragmentComponent extends Component {
    render(...args) {
        return h.$(
            h.h3("Header"),
            h.p("Paragraph 1"),
            h.p("Paragraph 2")
        );
    }
}
```

### State Management
OpenScript provides a simple reactive state system.

```javascript
import { Component, h, state } from './modular-openscript/index.js';

const counter = state(0);

class CounterComponent extends Component {
    render(...args) {
        return h.div(
            h.h3(`Count: ${counter.value}`),
            h.button({ onclick: () => counter.value++ }, "Increment"),
            ...args
        );
    }
}
```

### Context
Contexts allow you to share state across components.

```javascript
import { Component, h, context, putContext } from './modular-openscript/index.js';

// Register a context
putContext("Theme", "contexts.ThemeContext");

class ThemedComponent extends Component {
    constructor() {
        super();
        this.themeContext = context("Theme");
    }
    // ...
}
```

> [!WARNING]
> **Deprecation Notice**: `fetchContext` is deprecated. Please use `putContext` instead. `putContext` handles both loading and fetching logic more efficiently.

## Context Management

Contexts provide a way to organize and share state across your application.

### Creating Contexts

```javascript
import { putContext, context } from './modular-openscript/index.js';

// Register contexts
putContext(["global", "user", "page"], "AppContext");

// Access contexts
const gc = context("global");  // Global context
const uc = context("user");    // User context
const pc = context("page");    // Page context
```

### Using Context States

```javascript
// Initialize multiple states in a context
uc.states({
    cart: {},
    profile: null,
    isLoggedIn: false
});

// Access and modify state
uc.isLoggedIn.value = true;

// Add listeners to context states
uc.cart.listener((cartState) => {
    console.log(`Cart updated: ${Object.keys(cartState.value).length} items`);
});
```

**The `.states()` Helper**

The `.states()` method is a convenient helper that creates multiple state properties on a context at once:

```javascript
// Instead of:
uc.cart = state({});
uc.profile = state(null);
uc.isLoggedIn = state(false);

// You can use:
uc.states({
    cart: {},
    profile: null,
    isLoggedIn: false
});
```

Each key becomes a reactive `State` property on the context, automatically created using `state()`.

### Global State Pattern: Pass States to Components

**Best Practice**: Define global states in contexts, then pass them to components via the render method:

```javascript
// In your initialization (e.g., declarations.js)
const pc = context("page");
pc.states({
    pageTitle: "Home",
    loading: false
});

// Pass state to component when rendering
h.HomePage(pc.pageTitle, {
    parent: document.getElementById("root"),
    resetParent: true
});
```

**Component receives state in render:**

```javascript
class HomePage extends Component {
    // State is passed as parameter
    render(pageTitle, ...args) {
        return h.div(
            h.h1(pageTitle.value),  // Access via .value
            h.p("Welcome to the home page"),
            ...args
        );
    }
}
```

This pattern:
- ✅ Centralizes state management in contexts
- ✅ Makes components reusable and testable
- ✅ Automatically re-renders when state changes
- ✅ Keeps component logic clean

### Context Properties

You can also add non-reactive properties to contexts:

```javascript
gc.appName = "MyApp";
gc.version = "1.0.0";
```

## Event Handling

OpenScript provides a powerful event-driven architecture.

### Event Registration Pattern

Before using events, register them with the broker. This creates a centralized event catalog:

```javascript
import { broker } from './modular-openscript/index.js';

const $e = {
    system: {
        booted: true,
        needs: {
            reload: true,
        }
    },
    user: {
        authenticated: true,
        loggedOut: true,
        needs: {
            login: true,
            logout: true,
        },
        has: {
            loginError: true,
        }
    }
};

// Register all events at application startup
broker.registerEvents($e);

// Make events globally accessible
window.$e = $e;
```

This pattern:
- Provides clear event documentation
- Enables autocomplete in IDEs
- Creates namespaced event names (e.g., `user:authenticated`, `user:needs:login`)

### Declarative Listening (Mediators)
Use the `$$` prefix in Mediators to automatically register event listeners. Nested objects create namespaced events (e.g., `$$user.login` becomes `user:login`).

```javascript
import { Mediator, Utils } from './modular-openscript/index.js';

class AuthMediator extends Mediator {
    $$user = {
        login: (ed, event) => {
            const data = Utils.parsePayload(ed);
            console.log("User logged in", data.message);
        }
    };
}
```

### Imperative Listening
You can also listen to events directly using the global `broker` instance.

```javascript
import { broker, Utils } from './modular-openscript/index.js';

broker.on("user:login", (ed, event) => {
    const data = Utils.parsePayload(ed);
    console.log("User logged in", data.message);
});
```

### Emitting Events
Use `broker.send()` or `broker.broadcast()` to emit events.

```javascript
broker.send("user:login", payload({ username: "Alice" }));
```

### Advanced Patterns

#### Multi-Event Listening
You can listen to multiple events in a single handler by separating them with an underscore `_`.

```javascript
class UserMediator extends Mediator {
    $$user = {
        // Triggers on 'user:login' OR 'user:logout'
        login_logout: (ed, event) => {
            console.log(`Event ${event} triggered`);
        }
    };
}
```

#### Component Events
Components can listen to events from other components using `h.on`.

```javascript
import { Component, h } from './modular-openscript/index.js';
import { LoginButton } from './examples/event-handling.js';

class Dashboard extends Component {
    render(...args) {
        return h.div(
            // Listen to the 'rendered' event of LoginButton
            h.on(LoginButton, "rendered", () => {
                console.log("Login Button rendered");
            }),
            h.component(new LoginButton())
        );
    }
}
```

#### Component Methods as Listeners
Prefix component methods with `$_` to use them easily as event handlers in your markup.

```javascript
class MyComponent extends Component {
    $_handleClick(e) {
        console.log("Clicked!");
    }

    render() {
        return h.button({ onclick: this.$_handleClick }, "Click Me");
    }
}
```

### Special Attributes

OpenScript's markup engine recognizes special attributes that control element behavior:

#### DOM Manipulation Attributes

**`parent`** (HTMLElement)
- Specifies which parent element to append this element to
```javascript
h.div({ parent: document.getElementById("container") }, "Content")
```

**`resetParent`** (boolean)
- When `true`, clears all children from the parent before appending
```javascript
h.div({ parent: container, resetParent: true }, "Replace all content")
```

**`firstOfParent`** (boolean)
- When `true`, prepends the element as the first child of its parent
```javascript
h.div({ parent: container, firstOfParent: true }, "I'll be first")
```

**`replaceParent`** (boolean)
- When `true`, replaces the parent element entirely with this element
```javascript
h.div({ parent: oldElement, replaceParent: true }, "New content")
```

#### Event Attributes

**`listeners`** (object)
- Attach DOM event listeners; value can be a function or array of functions
```javascript
h.button({
    listeners: {
        click: handleClick,
        mouseover: [handler1, handler2]
    }
}, "Click me")
```

**`event`** (string)
- Component event name to emit after rendering
```javascript
h.div({ event: "custom:rendered" }, "Content")
```

**`eventParams`** (any | array)
- Parameters to pass with the component event
```javascript
h.div({
    event: "data:loaded",
    eventParams: [{ id: 123 }, "extra"]
}, "Content")
```

#### Component Attributes

**`component`** (Component)
- Associates a Component instance with the element
```javascript
h.div({ component: myComponentInstance }, "Wrapper")
```

**`c_attr`** (object)
- Custom attributes to pass to the associated component
```javascript
h.div({ c_attr: { userId: 123, role: "admin" } })
```

**`$` prefix** (any)
- Shorthand for component attributes; `$userId` becomes component attribute `userId`
```javascript
h.div({ $userId: 123, $role: "admin" })
// Equivalent to: c_attr: { userId: 123, role: "admin" }
```

**`withCAttr`** (boolean)
- Flag to enable component attribute processing

**`methods`** (object)
- Methods to attach to the element, accessible via `element.methods()`
```javascript
h.div({
    methods: {
        getData: () => ({ id: 1 }),
        setData: (data) => console.log(data)
    }
})
```

### Helper Functions

#### h.func() - Inline Event Handlers
Create callable string references for functions with arguments:

```javascript
class ProductCard extends Component {
    render(product) {
        return h.button(
            {
                // h.func creates: "broker.send('cart:add', payload({...}))"
                onclick: h.func(
                    "broker.send",
                    $e.cart.needs.addition,
                    payload({ product })
                )
            },
            "Add to Cart"
        );
    }
}
```

#### component.method() - Component Method Reference
Reference component methods in templates:

```javascript
class Form extends Component {
    submitForm() {
        console.log("Submitting...");
    }

    render() {
        return h.button(
            { onclick: this.method("submitForm") },
            "Submit"
        );
    }
}
```

## State Management

OpenScript provides reactive state management through the `state` helper.

### Automatic State Listening in Components
When you pass state to a component's `render()` method or use it in the render output, the component automatically listens to state changes and re-renders.

```javascript
import { Component, h, state } from './modular-openscript/index.js';

class Counter extends Component {
    count = state(0);

    $_increment() {
        this.count.value++;
    }

    // Component automatically re-renders when this.count changes
    render(...args) {
        return h.div(
            h.p(`Count: ${this.count.value}`),
            h.button({ onclick: this.$_increment }, "Increment")
        );
    }
}
```

### Direct State Listeners
You can also add direct listeners to state using the `.listener()` method.

```javascript
class MyComponent extends Component {
    count = state(0);

    constructor() {
        super();
        
        // Add a direct listener
        this.count.listener((currentState) => {
            console.log(`Count is now: ${currentState.value}`);
        });
    }

    render(...args) {
        return h.div(
            h.button(
                { onclick: () => this.count.value++ }, 
                "Increment"
            )
        );
    }
}
```

### State Methods
- **`.listener(callback)`**: Add a listener that fires when state changes
- **`.once(callback)`**: Add a one-time listener
- **`.off(id)`**: Remove a listener by ID
- **`.value`**: Get or set the state value

## Application Initialization

Complete application setup following Carata patterns:

```javascript
// 1. Define and register events
const $e = { /* event definitions */ };
broker.registerEvents($e);

// 2. Initialize contexts
putContext(["global", "user"], "AppContext");
const uc = context("user");
uc.states({ cart: {}, isLoggedIn: false });

// 3. Set up state listeners
uc.cart.listener((cart) => {
    console.log("Cart changed");
});

// 4. Initialize mediators
const cartMediator = new CartMediator();

// 5. Set up routing
router.on("/", () => { /* ... */ }, "home");
router.prefix("products").group(() => {
    router.on("/{id}/view", () => { /* ... */ }, "product.view");
});

// 6. Mount components
const dashboard = new Dashboard();
dashboard.mount(document.getElementById("app"));

// 7. Broadcast system ready
broker.broadcast($e.system.booted);

// 8. Start listening to routes
router.listen();
```

## Routing

OpenScript includes a built-in router for single-page applications using a fluent API:

```javascript
import { router } from './modular-openscript/index.js';

// Simple route
router.on("/", () => {
    console.log("Home page");
}, "home");

// Route with parameters
router.on("/users/{id}", () => {
    console.log(`User ID: ${router.params.id}`);
}, "user.view");

// Grouped routes with prefix
router.prefix("products").group(() => {
    router.on("/{productId}/view", () => {
        console.log(`Product: ${router.params.productId}`);
    }, "product.view");
    
    router.on("/create", () => {
        console.log("Create product");
    }, "product.create");
});

// Multiple routes to same handler
router.orOn(
    ["/login", "/signin"],
    () => {
        console.log("Login page");
    },
    ["auth.login", "auth.signin"]
);

// Programmatic navigation (by route name)
router.to("home");
router.to("user.view", { id: 123 });

// Navigation with query strings
router.to("products.view", { productId: 456, tab: "reviews" });
// Creates: /products/456/view?tab=reviews

// Start listening to route changes
router.listen();
```

### Router Methods
- **`.on(path, handler, name)`**: Register a route
- **`.orOn(paths, handler, names)`**: Register multiple paths to same handler
- **`.prefix(name)`**: Create a prefix for grouped routes
- **`.group(callback)`**: Group routes under a prefix
- **`.to(nameOrPath, params)`**: Navigate to a route
- **`.listen()`**: Start listening to URL changes
- **`.params`**: Access route parameters
- **`.qs`**: Access query string parameters

## Directory Structure


- `core/`: Core classes like `Runner`, `Emitter`, `State`, `Context`.
- `component/`: UI related classes like `Component`, `MarkupEngine`, `h`.
- `router/`: Routing logic.
- `broker/`: Event bus logic.
- `mediator/`: Business logic mediators.
- `utils/`: Helper functions.
- `examples/`: Usage examples.

## Optimizations

See `optimizations.md` for suggested improvements.
