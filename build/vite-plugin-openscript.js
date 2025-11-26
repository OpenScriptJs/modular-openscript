import fs from "fs";
import path from "path";
import { normalizePath } from "vite";
import MagicString from "magic-string";

/**
 * OpenScript Component Auto-Import Plugin
 * Automatically discovers components and provides IDE autocomplete + bundling
 */
export function openScriptComponentPlugin(options = {}) {
  const {
    componentsDir = "src/components",
    autoRegister = true,
    generateTypes = true,
  } = options;

  let config;
  let components = [];
  const virtualModuleId = "virtual:openscript-components";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "openscript-component-plugin",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    buildStart() {
      // Scan components directory
      const componentsPath = path.resolve(config.root, componentsDir);

      if (!fs.existsSync(componentsPath)) {
        console.warn(
          `[OpenScript] Components directory not found: ${componentsPath}`
        );
        return;
      }

      // Find all component files
      components = scanComponents(componentsPath);

      console.log(
        `[OpenScript] Found ${components.length} components:`,
        components.map((c) => c.name).join(", ")
      );

      // Generate TypeScript definitions if enabled
      if (generateTypes) {
        generateTypeDefinitions(config.root, componentsDir, components);
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        // Generate virtual module that imports all components
        return generateVirtualModule(
          config.root,
          componentsDir,
          components,
          autoRegister
        );
      }
    },

    transform(code, id) {
      // Only transform files in components directory
      if (!id.includes(componentsDir) || !id.endsWith(".js")) return;

      // Find class definition
      const classMatch = code.match(/class\s+(\w+)\s+extends\s+Component/);
      if (!classMatch) return;

      const className = classMatch[1];

      // If code already sets this.name explicitly, skip (simple check)
      if (code.includes(`this.name = "${className}"`)) return;

      const s = new MagicString(code);

      if (code.includes("constructor")) {
        // Inject after super()
        const superMatch = code.match(/(super\s*\([^)]*\)\s*;?)/);
        if (superMatch) {
          const index = superMatch.index + superMatch[0].length;
          s.appendRight(
            index,
            `\n    if (!this.name) this.name = "${className}";`
          );
        }
      } else {
        // No constructor, inject one
        const classDef = classMatch[0];
        const openBraceIndex = code.indexOf("{", code.indexOf(classDef));

        if (openBraceIndex !== -1) {
          s.appendRight(
            openBraceIndex + 1,
            `\n  constructor() { super(); this.name = "${className}"; }`
          );
        }
      }

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ source: id, includeContent: true }),
        };
      }
    },

    // HMR support
    handleHotUpdate({ file, server }) {
      if (file.includes(componentsDir)) {
        // Reload virtual module when components change
        const module = server.moduleGraph.getModuleById(
          resolvedVirtualModuleId
        );
        if (module) {
          server.moduleGraph.invalidateModule(module);
          return [module];
        }
      }
    },
  };
}

/**
 * Scan components directory recursively
 */
function scanComponents(dir, basePath = "") {
  const components = [];

  if (!fs.existsSync(dir)) return components;

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativePath = path.join(basePath, file.name);

    if (file.isDirectory()) {
      // Recursively scan subdirectories
      components.push(...scanComponents(fullPath, relativePath));
    } else if (file.name.endsWith(".js") && !file.name.endsWith(".test.js")) {
      // Extract component name from filename
      const name = path.basename(file.name, ".js");

      // Skip non-component files (lowercase, index, etc.)
      if (name[0] === name[0].toUpperCase() && name !== "index") {
        components.push({
          name,
          path: relativePath.replace(/\\/g, "/"),
        });
      }
    }
  }

  return components;
}

/**
 * Generate TypeScript definition file for IDE autocomplete
 */
function generateTypeDefinitions(root, componentsDir, components) {
  const dtsPath = path.resolve(root, "src/openscript-components.d.ts");

  const imports = components
    .map(
      (c) =>
        `import type ${c.name} from './${componentsDir}/${c.path.replace(
          ".js",
          ""
        )}';`
    )
    .join("\n");

  const properties = components
    .map((c) => `    ${c.name}: typeof ${c.name};`)
    .join("\n");

  const content = `// Auto-generated by OpenScript - DO NOT EDIT
// This file provides IDE autocomplete for h.ComponentName

import type { MarkupEngine } from 'modular-openscriptjs';

${imports}

declare module 'modular-openscriptjs' {
  interface MarkupEngine {
${properties}
  }
}

export {};
`;

  fs.writeFileSync(dtsPath, content, "utf-8");
  console.log(`[OpenScript] Generated type definitions: ${dtsPath}`);
}

/**
 * Generate virtual module content that imports and registers all components
 */
function generateVirtualModule(root, componentsDir, components, autoRegister) {
  const imports = components
    .map((c) => {
      const absolutePath = normalizePath(
        path.resolve(root, componentsDir, c.path)
      );
      return `import ${c.name} from '${absolutePath}';`;
    })
    .join("\n");

  const exports = components.map((c) => c.name).join(", ");

  const registration = autoRegister
    ? `
// Auto-register all components
const components = { ${exports} };

export async function registerAllComponents() {
  for (const [name, Component] of Object.entries(components)) {
    const instance = new Component();
    await instance.mount();
  }
}
`
    : "";

  return `// Auto-generated by OpenScript Component Plugin
${imports}

${registration}

// Export all components for manual use
export { ${exports} };

// Export component registry
export default { ${exports} };
`;
}
