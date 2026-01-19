import type { BunCosmosConfig, ResolvedBunCosmosConfig } from "./types";

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Omit<ResolvedBunCosmosConfig, "cosmosConfigPath"> = {
  ports: {
    ui: 5000,
    assets: 3008,
    proxy: 3009,
  },
  fixturesDir: "./examples",
  outdir: "./cosmos/out",
  rendererEntry: "./cosmos/cosmos.renderer.tsx",
  cosmosHtml: "./cosmos/cosmos.html",
  plugins: [],
  extraWatchFiles: ["./cosmos.imports.js"],
  sourcemap: "external",
  development: true,
};

/**
 * Resolves user configuration with defaults
 */
export function resolveConfig(userConfig: BunCosmosConfig = {}): ResolvedBunCosmosConfig {
  return {
    ports: {
      ...DEFAULT_CONFIG.ports,
      ...userConfig.ports,
    },
    fixturesDir: userConfig.fixturesDir ?? DEFAULT_CONFIG.fixturesDir,
    outdir: userConfig.outdir ?? DEFAULT_CONFIG.outdir,
    rendererEntry: userConfig.rendererEntry ?? DEFAULT_CONFIG.rendererEntry,
    cosmosHtml: userConfig.cosmosHtml ?? DEFAULT_CONFIG.cosmosHtml,
    plugins: userConfig.plugins ?? DEFAULT_CONFIG.plugins,
    extraWatchFiles: userConfig.extraWatchFiles ?? DEFAULT_CONFIG.extraWatchFiles,
    sourcemap: userConfig.sourcemap ?? DEFAULT_CONFIG.sourcemap,
    development: userConfig.development ?? DEFAULT_CONFIG.development,
    cosmosConfigPath: userConfig.cosmosConfigPath,
  };
}
