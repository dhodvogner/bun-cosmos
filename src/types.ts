import type { BunPlugin } from "bun";

/**
 * Configuration options for Bun-Cosmos
 */
export interface BunCosmosConfig {
  /**
   * Port configuration for the servers
   * @default { ui: 5000, assets: 3008, proxy: 3009 }
   */
  ports?: {
    /** Port for Cosmos Manager UI (internal) */
    ui?: number;
    /** Port for Renderer Assets server (internal) */
    assets?: number;
    /** Port for the main proxy server (the one you open in browser) */
    proxy?: number;
  };

  /**
   * Directory containing your fixture files
   * @default "./examples"
   */
  fixturesDir?: string;

  /**
   * Output directory for built renderer
   * @default "./cosmos/out"
   */
  outdir?: string;

  /**
   * Path to the renderer entry point
   * @default "./cosmos/cosmos.renderer.tsx"
   */
  rendererEntry?: string;

  /**
   * Path to the cosmos.html wrapper
   * @default "./cosmos/cosmos.html"
   */
  cosmosHtml?: string;

  /**
   * Bun build plugins to use when building the renderer
   * Example: [tailwindPlugin()]
   */
  plugins?: BunPlugin[];

  /**
   * Additional files to watch for changes (e.g., cosmos.imports.js)
   * @default ["./cosmos.imports.js"]
   */
  extraWatchFiles?: string[];

  /**
   * Enable source maps for debugging
   * @default "external"
   */
  sourcemap?: "none" | "inline" | "external";

  /**
   * Custom cosmos.config.json path
   * If not provided, will use default cosmos.config.json in root
   */
  cosmosConfigPath?: string;

  /**
   * Development mode settings
   */
  development?: boolean;
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedBunCosmosConfig extends Required<Omit<BunCosmosConfig, "plugins" | "cosmosConfigPath">> {
  plugins: BunPlugin[];
  cosmosConfigPath?: string;
  ports: Required<NonNullable<BunCosmosConfig["ports"]>>;
}
