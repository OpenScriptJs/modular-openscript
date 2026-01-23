import { defineConfig } from "vite";
import { resolve } from "path";
import { openScriptComponentPlugin } from "./build/vite-plugin-openscript.js";

export default defineConfig({
  plugins: [openScriptComponentPlugin()],

  // CSS configuration
  css: {
    postcss: "./postcss.config.js",
  },

  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, "src/index.js"),
      name: "OpenScript",
      // Output formats
      formats: ["es", "umd"],
      fileName: (format) => `modular-openscriptjs.${format}.js`,
    },

    rollupOptions: {
      // Preserve module structure
      output: {
        // Use named exports only (no default export)
        exports: "named",
        // Preserve original names where possible
        preserveModules: false,
        // Ensure component names are kept in comments
        banner:
          "/* OpenScript Framework - Built with component name preservation */",
      },
    },

    // Source maps for debugging
    sourcemap: true,

    // Target modern browsers
    target: "es2020",

    minify: "terser",
    terserOptions: {
      // Preserve class names
      keep_classnames: true,
      keep_fnames: true,
      mangle: {
        // Don't mangle properties that start with these patterns
        reserved: ["Component", "State", "Mediator", "Broker"],
      },
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
});
