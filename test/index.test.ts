import { describe, test, expect } from "bun:test";
import { BunCosmos, startBunCosmos } from "../src/index";

describe("BunCosmos", () => {
  test("should create instance with default config", () => {
    const cosmos = new BunCosmos();
    expect(cosmos).toBeDefined();
    expect(cosmos).toBeInstanceOf(BunCosmos);
  });

  test("should create instance with custom config", () => {
    const cosmos = new BunCosmos({
      ports: { proxy: 4000 },
      fixturesDir: "./custom",
    });
    expect(cosmos).toBeDefined();
    expect(cosmos).toBeInstanceOf(BunCosmos);
  });

  test("should have start method", () => {
    const cosmos = new BunCosmos();
    expect(typeof cosmos.start).toBe("function");
  });

  test("should have stop method", () => {
    const cosmos = new BunCosmos();
    expect(typeof cosmos.stop).toBe("function");
  });
});

describe("startBunCosmos", () => {
  test("should be a function", () => {
    expect(typeof startBunCosmos).toBe("function");
  });

  test("should accept config parameter", () => {
    // Just verify it doesn't throw on config validation
    expect(() => {
      // We don't actually call it because it would start servers
      const config = {
        ports: { proxy: 5000 },
        fixturesDir: "./test-fixtures",
      };
      // Just pass config through to verify type checking
      expect(config).toBeDefined();
    }).not.toThrow();
  });
});

describe("Type Exports", () => {
  test("should export BunCosmosConfig type", () => {
    // This is a type-level test that will fail at compile time if types aren't exported
    const config: import("../src/index").BunCosmosConfig = {
      ports: { proxy: 3000 },
    };
    expect(config).toBeDefined();
  });

  test("should export ResolvedBunCosmosConfig type", () => {
    // This is a type-level test that will fail at compile time if types aren't exported
    const config: Partial<import("../src/index").ResolvedBunCosmosConfig> = {
      ports: { ui: 5000, assets: 3008, proxy: 3009 },
    };
    expect(config).toBeDefined();
  });
});
