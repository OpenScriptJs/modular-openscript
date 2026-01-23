# OpenScript Build System

This directory contains the build configuration and tools for bundling OpenScript with Vite.

## Problem

When building OpenScript apps with Vite, minification changes class names:
```javascript
class TodoApp extends Component { } // Becomes: class t extends e { }
```

This breaks OpenScript's component registration which relies on `constructor.name`:
```javascript
this.name = name ?? this.constructor.name; // Gets 't' instead of 'TodoApp'
```

## Solution

The `vite-plugin-openscript.js` plugin preprocesses component files before bundling with two transformations:

### 1. Component Name Preservation

**Before transformation:**
```javascript
class TodoApp extends Component {
    render() {
        return h.div("Hello");
    }
}
```

**After transformation:**
```javascript
class TodoApp extends Component {
    constructor(...args) {
        super(...args);
        this.name = 'TodoApp'; // ← Explicitly set, survives minification
    }
    render() {
        return h.div("Hello");
    }
}
```

### 2. Element/Component Name Protection

**Before transformation:**
```javascript
h.div({ class: "container" }, h.TodoApp())
```

**After transformation:**
```javascript
h['div']({ class: "container" }, h['TodoApp']())
// ↑ Element and component names preserved as strings
```

This prevents minification from mangling property access (e.g., `h.div` → `h.a`).

## How It Works

1. **Parse**: Uses Babel to parse component files into an AST
2. **Detect**: Finds all classes that extend `Component` and all `h.property` accesses
3. **Transform**: 
   - Injects `this.name = 'ComponentName'` in component constructors
   - Converts `h.element` to `h['element']` for all property accesses
4. **Generate**: Produces modified code that Vite can bundle safely

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/openscript.es.js and dist/openscript.umd.js
```

## Configuration

See `vite.config.js` for:
- Plugin registration
- Terser options to preserve class/function names
- Output formats (ES and UMD)
- Source map generation

## Files

- **vite-plugin-openscript.js** - Vite plugin for component transformation
- **vite.config.js** - Vite configuration
- **package.json** - Dependencies and scripts
