# Best practices

- Putting a state on the root component of the app can result in a memory leak that keeps at least double of the dom nodes currently rendered. It's best to have a second level component on which the states can are passed if at all there must be global states.

- All components should be placed in a separate folder, e.g. `src/components` for easy building. Mixing components with other files can lead to build errors.

- If a component doesn't directly extend the `Component` class, it should explicitly have it's name attribute set, like `name = "MyComponent";` in the class. This is required for the `h` (Markup Engine) object to register the component.

- For functional components, ensure the name of the component starts with a capital letter, e.g. `function MyComponent(...){...}`.

- When setting up a new project, separate configuration into files. For example, `ojs.config.js` to configure the router and other necessary ojs objects, `contexts.js` to configure contexts, `routes.js` to configure routes, etc. and finally include them into your `index.js` or `main.js` file. This makes it easier to manage and update the configuration.

- Place mediators into a separate folder, e.g. `src/mediators` for easy building. Mixing mediators with other files can lead to build errors.

- Mediators should be stateless and only have event handlers to handle application logic.

- Use contexts to keep global states. Contexts are objects that can be used to share data between components. They are initialized in the `contexts.js` file and can be used in any component by importing them from the `contexts.js` file.

- The `app()` function is the IoC container. You can use it to register and get instances that should be shared around the application.

# Router Notes

The `Router` class in OpenScript handles client-side routing.

## Initialization & usage

- **`router.listen()`**: This must be called to start listening to route changes and to handle the current initial route.
  - _Crucial_: It should be called in the entry point (e.g., `main.js`) **AFTER** all routes and services have been configured. Calling it prematurely might lead to 404s or unhandled routes if the route definitions haven't been loaded yet.
  - It attaches a `popstate` listener to handle browser back/forward buttons.
- **Dependencies**: The Router uses the `broker` to emit events (`ojs:beforeRouteChange`, `ojs:routeChanged`).

## Defining Routes

- **`router.on(path, action, name)`**: Registers a route.
  - `path`: The URL path pattern. Supports dynamic segments using `{paramName}`.
  - `action`: The function to execute when the route matches.
  - `name` (optional): A unique name for the route, allowing for reverse routing (generating URLs by name).
- **`router.orOn(paths, action, names)`**: Registers multiple paths that point to the same action.
- **`router.default(action)`**: Sets a catch-all action for when no route matches (404). Default behavior is `alert("404 File Not Found")`.
- **`router.prefix(name).group(callback)`**: Groups routes under a common prefix.
  - _Note_: The `callback` is executed immediately, and routes defined inside will have the prefix prepended.

## Navigation

- **`router.to(path, qs)`**: Navigates to a path or named route.
  - `path`: Can be a raw URL path segments or a registered route name.
  - `qs`: Query string parameters object.
  - It pushes a new state to `window.history` and calls `listen()` to trigger the route action.
- **`router.toName(routeName, params)`**: Navigates to a named route, replacing dynamic segments with values from `params`.
- **`router.back()`**: Navigate back in history.
- **`router.forward()`**: Navigate forward in history.
- **`router.redirect(to)`**: Performs a hard browser redirect (modifies `window.location.href`).

## Route Matching & Parameters

- **Dynamic Segments**: Routes can have `{param}` segments (e.g., `/user/{id}`).
- **Wildcards**: `{...}` matches any segment, treated effectively as `*`.
- **`router.params`**: After matching a route, this object contains the values of dynamic segments.
- **`router.qs`**: Contains `URLSearchParams` for the current query string.
- **`router.current()`**: Returns the current path.
- **`router.is(nameOrRoute)`**: Checks if the current route matches a specific name or path. useful for setting active states on navigation links.

## Configuration

- **`router.runtimePrefix(prefix)`**: Sets a prefix that is stripped or added handling runtime path resolutions (useful for sub-directory deployments).
- **`router.basePath(path)`**: Sets a base path for the router.

## Internal Mechanics

- The router uses a nested `Map` structure for efficient route matching (Trie-like structure where each path segment is a key).
- It handles `popstate` events automatically once `listen()` is called.
