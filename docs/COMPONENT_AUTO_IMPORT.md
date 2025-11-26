# OpenScript Component Auto-Import System

## How to Use (For Developers)

### 1. Install OpenScript

```bash
npm install modular-openscriptjs
```

### 2. Configure Vite

```javascript
// vite.config.js
import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  plugins: [
    openScriptComponentPlugin({
      componentsDir: "src/components", // default
      autoRegister: true, // auto-register components
      generateTypes: true, // generate .d.ts for IDE
    }),
  ],
});
```

### 3. Create Components

```javascript
// src/components/TodoList.js
import { Component, app, state } from "modular-openscriptjs";

const h = app("h");

export default class TodoList extends Component {
  constructor() {
    super();
    this.todos = state([]);
  }

  render() {
    return h.div(
      h.h2("My Todos"),
      h.ul(...this.todos.value.map((todo) => h.li(todo.text)))
    );
  }
}
```

### 4. Use Components with Auto-Import

```javascript
// src/main.js
import { app } from "modular-openscriptjs";
import "virtual:openscript-components"; // Auto-imports all components

const h = app("h");

// IDE will autocomplete ComponentName!
// Component is automatically imported and bundled by Vite!
h.TodoList({ parent: document.body });
```

## Features

✅ **IDE Autocomplete**: Type `h.` and see all your components
✅ **Auto-Import**: No need to manually import components
✅ **TypeScript Support**: Generated `.d.ts` files
✅ **HMR Support**: Hot module replacement during development
✅ **Automatic Bundling**: Vite includes all components in bundle
✅ **Nested Components**: Supports subdirectories in components/

## How It Works

1. **Component Discovery**: Plugin scans `src/components/` for all Component files
2. **Type Generation**: Creates `openscript-components.d.ts` with type definitions
3. **Virtual Module**: Creates a virtual module that imports all components
4. **Auto-Registration**: Optionally auto-registers all components on app start
5. **IDE Support**: TypeScript definitions provide autocomplete and type checking

## Advanced Usage

### Manual Component Registration

```javascript
// vite.config.js
openScriptComponentPlugin({
  autoRegister: false, // Disable auto-registration
});
```

```javascript
// src/main.js
import components, {
  registerAllComponents,
} from "virtual:openscript-components";

// Manually register when needed
await registerAllComponents();

// Or register individually
const todoList = new components.TodoList();
await todoList.mount();
```

### Custom Components Directory

```javascript
openScriptComponentPlugin({
  componentsDir: "src/ui/components",
});
```

### Exclude Components from Auto-Discovery

Name files with lowercase or prefix with underscore:

- `utils.js` ❌ (lowercase, won't be discovered)
- `_BaseComponent.js` ❌ (underscore prefix, won't be discovered)
- `TodoList.js` ✅ (PascalCase, will be discovered)

## TypeScript Example

```typescript
// src/main.ts
import { app } from "modular-openscriptjs";
import "virtual:openscript-components";

const h = app("h");

// Full type safety!
h.TodoList({
  parent: document.body,
  resetParent: true,
});
```

## Comparison with JSX

**JSX/React:**

```jsx
import TodoList from "./components/TodoList";
<TodoList />;
```

**OpenScript (with plugin):**

```javascript
import "virtual:openscript-components";
h.TodoList();
```

Both provide:

- ✅ IDE autocomplete
- ✅ Type checking
- ✅ Proper bundling
- ✅ HMR support

## Migration from Manual Imports

**Before:**

```javascript
import TodoList from "./components/TodoList";
import Header from "./components/Header";

const todoList = new TodoList();
await todoList.mount();
h.TodoList({ parent: document.body });
```

**After:**

```javascript
import "virtual:openscript-components";

// Components auto-registered and available on h!
h.TodoList({ parent: document.body });
h.Header({ parent: document.body });
```
