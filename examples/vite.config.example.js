// Example vite.config.js for OpenScript projects
import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  plugins: [
    openScriptComponentPlugin({
      // Directory where your components are located
      componentsDir: "src/components",

      // Auto-register all components on app start
      // Set to false if you want manual control
      autoRegister: true,

      // Generate TypeScript definitions for IDE autocomplete
      // Creates src/openscript-components.d.ts
      generateTypes: true,
    }),
  ],

  build: {
    target: "es2015",
  },
});
