import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Use happy-dom for fast DOM simulation
    environment: "happy-dom",

    // Global test utilities (optional)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "examples/",
        "templates/",
        "build/",
        "**/*.config.js",
        "**/test/**",
        "**/__tests__/**",
      ],
    },

    // Test file patterns
    include: [
      "**/*.{test,spec}.{js,mjs,cjs}",
      "**/__tests__/**/*.{js,mjs,cjs}",
    ],

    // Setup files (if needed)
    // setupFiles: ['./test/setup.js'],
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@core": resolve(__dirname, "./src/core"),
      "@component": resolve(__dirname, "./src/component"),
      "@router": resolve(__dirname, "./src/router"),
      "@broker": resolve(__dirname, "./src/broker"),
      "@mediator": resolve(__dirname, "./src/mediator"),
      "@utils": resolve(__dirname, "./src/utils"),
    },
  },
});
