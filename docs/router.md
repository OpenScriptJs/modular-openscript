# Router

The OpenScript Router manages navigation within your single-page application. It supports named routes, parameters, chaining, and route grouping.

## Defining Routes

You configure routes in `ojs.config.js` (or wherever you configure your app) using the `router` service.

### Basic Route

Use `router.on(path, action, [name])` to define a route.

```javascript
import { app } from "modular-openscriptjs";

const router = app("router");

router.on(
  "/",
  () => {
    // Render Home Component
    h.app(h.HomeComponent());
  },
  "home",
); // Optional name "home"
```

### Handling Route Changes

It's common to define a helper (like `appRender`) to handle swapping active components in your root element.

```javascript
import { app, dom } from "modular-openscriptjs";

const h = app("h");
const rootElement = dom.id("app-root");

// Helper to swap components
const appRender = (component) => {
  return h.App(component, {
    parent: rootElement,
    resetParent: router.reset, // Uses router state
    reconcileParent: true, // Enables DOM diffing (smoother animations)
  });
};

router.on("/about", () => {
  appRender(h.AboutComponent());
});
```

### Chaining Routes

You can chain method calls to define multiple routes cleanly.

```javascript
router
  .on("/about", () => h.app(h.About()), "about")
  .on("/contact", () => h.app(h.Contact()), "contact");
```

### Multiple Paths for One Action (`orOn`)

If you want multiple paths to trigger the same action (e.g., legacy URLs), use `orOn`.

```javascript
// Both /login and /signin run the same action
router.orOn(
  ["/login", "/signin"],
  () => h.app(h.Login()),
  ["login", "signin"], // Optional names for each path respectively
);
```

## Route Parameters

Dynamic segments are defined with curly braces `{paramName}`.

```javascript
router.on(
  "/user/{id}",
  () => {
    // Access parameter via router.params
    const userId = router.params.id;
    h.app(h.UserProfile({ id: userId }));
  },
  "user.profile",
);
```

## Route Groups (`prefix`)

You can group routes under a common path prefix.

```javascript
router.prefix("/admin").group(() => {
    // URL: /admin/dashboard
    router.on("/dashboard", () => ..., "admin.dashboard");

    // URL: /admin/users
    router.on("/users", () => ..., "admin.users");
});
```

## Navigation

To navigate programmatically, use `router.to(pathOrName, params)`.

```javascript
// Navigate by path
router.to("/about");

// Navigate by name (Recommended)
router.to("user.profile", { id: 42 });

// Navigate by name with query strings (if param keys don't match route params)
router.to("search", { q: "openscript" }); // /search?q=openscript
```

## Checking Current Route

Use `router.is(nameOrPath)` to check the active route (useful for active menu states).

```javascript
if (router.is("home")) {
  // We are on the home page
}
```

## Configuration

- `router.basePath('/app')`: Sets a base path for all routes.
- `router.default(action)`: Sets the 404/Default action if no route is found.

```javascript
router.default(() => {
  h.app(h.NotFoundComponent());
});
```
