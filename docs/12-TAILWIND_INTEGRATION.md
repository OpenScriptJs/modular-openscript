# TailwindCSS Integration with OpenScript

## Overview

OpenScript supports TailwindCSS through a custom integration that recognizes class names in the OSM (OpenScript Markup) syntax.

## How It Works

### 1. Content Detection

Tailwind's JIT compiler scans JavaScript files for class names. Our configuration targets the OSM pattern:

```javascript
h.div({ class: "bg-blue-500 text-white p-4" }, "Content")
```

The `class` attribute values are automatically detected by Tailwind's content scanner.

### 2. Dynamic Classes

For dynamically generated classes, use the `safelist` in `tailwind.config.js`:

```javascript
// In tailwind.config.js
safelist: [
  {
    pattern: /bg-(red|green|blue)-(100|900)/,
  }
]
```

This ensures Tailwind includes these classes even if they're not found during static analysis.

## Usage Examples

### Basic Usage

```javascript
import { Component, h } from './index.js';

class Card extends Component {
    render(title, content, ...args) {
        return h.div(
            { 
                class: "bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto"
            },
            h.h2({ class: "text-2xl font-bold text-gray-800 mb-4" }, title),
            h.p({ class: "text-gray-600" }, content),
            ...args
        );
    }
}
```

### Conditional Classes

```javascript
class Button extends Component {
    render(text, variant = 'primary', ...args) {
        const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
        const variantClasses = {
            primary: "bg-blue-500 hover:bg-blue-600 text-white",
            secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
            danger: "bg-red-500 hover:bg-red-600 text-white"
        };
        
        return h.button({
            class: `${baseClasses} ${variantClasses[variant]}`
        }, text, ...args);
    }
}
```

### Responsive Design

```javascript
class ResponsiveGrid extends Component {
    render(...items) {
        return h.div(
            { 
                class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            },
            ...items
        );
    }
}
```

### Using State for Dynamic Classes

```javascript
import { Component, h, state } from './index.js';

class TodoItem extends Component {
    render(todo, ...args) {
        return h.div(
            {
                class: `p-4 border rounded ${
                    todo.completed.value 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200'
                }`
            },
            h.span({
                class: todo.completed.value 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-800'
            }, todo.text),
            ...args
        );
    }
}
```

## Custom Utility Classes

Define reusable component classes in `styles/tailwind.css`:

```css
@layer components {
  .os-card {
    @apply bg-white rounded-lg shadow-md p-4;
  }
  
  .os-btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

Usage:
```javascript
h.div({ class: "os-card" }, 
    h.button({ class: "os-btn-primary" }, "Click me")
)
```

## Best Practices

1. **Use Template Literals for Complex Classes**:
   ```javascript
   class: `base-classes ${condition ? 'variant-a' : 'variant-b'}`
   ```

2. **Create Helper Functions**:
   ```javascript
   function classNames(...classes) {
       return classes.filter(Boolean).join(' ');
   }
   
   h.div({ class: classNames(
       'base-class',
       isActive && 'active-class',
       hasError && 'error-class'
   )})
   ```

3. **Safelist Dynamic Patterns**:
   If generating classes from data, add patterns to `safelist` in config

4. **Use Custom Components**:
   Create reusable components with predefined Tailwind styles

## Setup

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for production (includes Tailwind purge)
npm run build
```

## Integration with Vite

The build process:
1. PostCSS processes Tailwind directives
2. OpenScript plugin transforms components
3. Tailwind JIT scans for class names
4. Vite bundles everything with purged CSS
