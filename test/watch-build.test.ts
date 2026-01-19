import { describe, test, expect } from "bun:test";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { build } from "../src/watch-build";

const TEST_DIR = "/tmp/bun-cosmos-test";

describe("Watch Build", () => {
  test("should export build function", () => {
    expect(typeof build).toBe("function");
  });

  test("should build without watch mode", async () => {
    // Create test files
    mkdirSync(TEST_DIR, { recursive: true });
    const entryPath = join(TEST_DIR, "entry.ts");
    writeFileSync(entryPath, "console.log('test');");

    try {
      const output = await build({
        entrypoints: [entryPath],
        outdir: join(TEST_DIR, "out"),
        sourcemap: "external",
      });

      expect(output).toBeDefined();
      expect(output.success).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test("should accept plugins in config", async () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const entryPath = join(TEST_DIR, "entry.ts");
    writeFileSync(entryPath, "const x = 1;");

    const mockPlugin = {
      name: "test-plugin",
      setup() {},
    };

    try {
      const output = await build({
        entrypoints: [entryPath],
        outdir: join(TEST_DIR, "out"),
        plugins: [mockPlugin],
      });

      expect(output).toBeDefined();
      expect(output.success).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });
});
