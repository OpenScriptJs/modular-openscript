## Component Auto-Import Feature

OpenScript provides automatic component discovery and import, similar to JSX, giving you IDE autocomplete and ensuring all components are properly bundled.

### Setup

```javascript
// vite.config.js
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default {
  plugins: [openScriptComponentPlugin()],
};
```

### Usage

```javascript
// src/main.js
import { app } from "modular-openscriptjs";
import "virtual:openscript-components"; // Auto-imports all components!

const h = app("h");

// IDE will autocomplete component names!
// Components are automatically imported and bundled!
h.TodoList({ parent: document.body });
h.Header({ parent: document.body });
```

**Benefits:**

- ✅ IDE autocomplete for `h.ComponentName`
- ✅ Automatic component imports (no manual imports needed)
- ✅ TypeScript support with generated `.d.ts` files
- ✅ Proper Vite bundling
- ✅ Hot Module Replacement (HMR)

See [Component Auto-Import Guide](./docs/COMPONENT_AUTO_IMPORT.md) for details.
