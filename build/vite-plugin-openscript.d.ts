// Type definitions for vite-plugin-openscript
// Project: https://github.com/OpenScriptJs/modular-openscript

export interface OpenScriptComponentPluginOptions {
  /**
   * Directory where components are located
   * @default 'src/components'
   */
  componentsDir?: string;

  /**
   * Automatically register all components on app start
   * @default true
   */
  autoRegister?: boolean;

  /**
   * Generate TypeScript definitions for IDE autocomplete
   * @default true
   */
  generateTypes?: boolean;
}

/**
 * OpenScript Component Auto-Import Plugin
 * Automatically discovers components and provides IDE autocomplete + bundling
 */
export function openScriptComponentPlugin(
  options?: OpenScriptComponentPluginOptions
): any;
