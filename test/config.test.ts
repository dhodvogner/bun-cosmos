import { describe, test, expect } from "bun:test";
import { resolveConfig } from "../src/config";
import type { BunCosmosConfig } from "../src/types";

describe("Config Resolution", () => {
  test("should use default values when no config provided", () => {
    const config = resolveConfig();

    expect(config.ports.ui).toBe(5000);
    expect(config.ports.assets).toBe(3008);
    expect(config.ports.proxy).toBe(3009);
    expect(config.fixturesDir).toBe("./examples");
    expect(config.outdir).toBe("./cosmos/out");
    expect(config.rendererEntry).toBe("./cosmos/cosmos.renderer.tsx");
    expect(config.cosmosHtml).toBe("./cosmos/cosmos.html");
    expect(config.plugins).toEqual([]);
    expect(config.extraWatchFiles).toEqual(["./cosmos.imports.js"]);
    expect(config.sourcemap).toBe("external");
    expect(config.development).toBe(true);
  });

  test("should override default ports", () => {
    const config = resolveConfig({
      ports: {
        proxy: 4000,
        ui: 6000,
      },
    });

    expect(config.ports.proxy).toBe(4000);
    expect(config.ports.ui).toBe(6000);
    expect(config.ports.assets).toBe(3008); // Should keep default
  });

  test("should override fixturesDir", () => {
    const config = resolveConfig({
      fixturesDir: "./src/components",
    });

    expect(config.fixturesDir).toBe("./src/components");
  });

  test("should override outdir", () => {
    const config = resolveConfig({
      outdir: "./build",
    });

    expect(config.outdir).toBe("./build");
  });

  test("should accept custom plugins", () => {
    const mockPlugin = {
      name: "test-plugin",
      setup() {},
    };

    const config = resolveConfig({
      plugins: [mockPlugin],
    });

    expect(config.plugins).toHaveLength(1);
    expect(config.plugins[0]?.name).toBe("test-plugin");
  });

  test("should override extraWatchFiles", () => {
    const config = resolveConfig({
      extraWatchFiles: ["./custom.js", "./other.ts"],
    });

    expect(config.extraWatchFiles).toEqual(["./custom.js", "./other.ts"]);
  });

  test("should override sourcemap", () => {
    const config = resolveConfig({
      sourcemap: "inline",
    });

    expect(config.sourcemap).toBe("inline");
  });

  test("should override development flag", () => {
    const config = resolveConfig({
      development: false,
    });

    expect(config.development).toBe(false);
  });

  test("should handle partial port configuration", () => {
    const config = resolveConfig({
      ports: {
        proxy: 8080,
      },
    });

    expect(config.ports.proxy).toBe(8080);
    expect(config.ports.ui).toBe(5000);
    expect(config.ports.assets).toBe(3008);
  });

  test("should accept cosmosConfigPath", () => {
    const config = resolveConfig({
      cosmosConfigPath: "./custom-cosmos.config.json",
    });

    expect(config.cosmosConfigPath).toBe("./custom-cosmos.config.json");
  });

  test("should handle empty config object", () => {
    const config = resolveConfig({});

    expect(config.ports.ui).toBe(5000);
    expect(config.fixturesDir).toBe("./examples");
  });

  test("should handle multiple overrides", () => {
    const mockPlugin = { name: "test", setup() {} };
    const userConfig: BunCosmosConfig = {
      ports: { proxy: 9000, ui: 9001, assets: 9002 },
      fixturesDir: "./custom-fixtures",
      outdir: "./custom-out",
      plugins: [mockPlugin],
      sourcemap: "none",
      development: false,
    };

    const config = resolveConfig(userConfig);

    expect(config.ports.proxy).toBe(9000);
    expect(config.ports.ui).toBe(9001);
    expect(config.ports.assets).toBe(9002);
    expect(config.fixturesDir).toBe("./custom-fixtures");
    expect(config.outdir).toBe("./custom-out");
    expect(config.plugins).toHaveLength(1);
    expect(config.sourcemap).toBe("none");
    expect(config.development).toBe(false);
  });
});
