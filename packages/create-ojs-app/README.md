# create-ojs-app

CLI tool to scaffold new OpenScript projects.

## Usage

```bash
npx create-ojs-app <project-name> [template]
```

## Available Templates

| Template    | Description                                  |
| ----------- | -------------------------------------------- |
| `basic`     | Basic OpenScript project with Vite (default) |
| `tailwind`  | Project with TailwindCSS integration         |
| `bootstrap` | Project with Bootstrap 5 integration         |

## Examples

```bash
# Create a basic project
npx create-ojs-app my-app

# Create a project with TailwindCSS
npx create-ojs-app my-app tailwind

# Create a project with Bootstrap
npx create-ojs-app my-app bootstrap
```

## What's Included

Each scaffolded project includes:

- 📦 Vite for fast development and building
- 🎯 Pre-configured OpenScript setup with Vite plugin
- 🛣️ Router with example routes
- 🧩 Example components (App, HomePage, AboutUs, Counter)
- 📝 Context management setup
- 📡 Event broker with mediators

## ⚠️ Important: Vite Plugin Required!

**The OpenScript Vite plugin is REQUIRED for your application to work.** All templates come pre-configured with the plugin in `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  // ...
  plugins: [
    openScriptComponentPlugin({
      componentsDir: "src/components",
      autoRegister: true,
      generateTypes: true,
    }),
  ],
});
```

**Do NOT remove this plugin** - it handles component registration, type generation, and other essential build-time transformations.

## Learn More

- [OpenScriptJs Documentation](https://github.com/OpenScriptJs/modular-openscript)
- [Vite Documentation](https://vitejs.dev/)

## License

MIT
