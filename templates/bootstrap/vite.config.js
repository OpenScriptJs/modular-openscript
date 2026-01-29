import { defineConfig } from "vite";
import { openScriptComponentPlugin } from "modular-openscriptjs/plugin";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  plugins: [
    openScriptComponentPlugin({
      componentsDir: "src/components",
    }),
  ],
});
