// Credits: This code is adapted from: https://github.com/oven-sh/bun/issues/5866#issuecomment-2691700945
// Thanks to @dpeek for the original implementation!
import type { BuildOutput } from "bun";
import fs from "node:fs";
import { join, resolve } from "node:path";

const cwd = process.cwd();

function absolute(path: string) {
  return resolve(cwd, path);
}

// Recursively read all files in the watchDir and collect the ones with .fixture. extension
function getFixtureFiles(watchDir: string): Set<string> {
  const fixtures = new Set<string>();
  function readDirRecursively(dir: string) {
    if (!fs.existsSync(dir)) return; // Safety check
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        readDirRecursively(fullPath);
      } else if (entry.isFile() && (fullPath.endsWith(".fixture.ts") || fullPath.endsWith(".fixture.tsx"))) {
        fixtures.add(absolute(fullPath));
      }
    }
  }
  readDirRecursively(absolute(watchDir));
  return fixtures;
}

type BuildConfig = Parameters<typeof Bun.build>[0] & {
  watch?: string;
  extraWatchFiles?: string[]; // <--- NEW OPTION
  onRebuild?: (output: BuildOutput) => void;
};

export async function build(config: BuildConfig) {
  let { watch, extraWatchFiles = [], onRebuild, sourcemap = "external", ...rest } = config;

  if (watch && config.sourcemap !== "external") {
    console.error("[Bun-Cosmos] Watch requires external sourcemap, setting to external");
  }

  let output = await Bun.build({ ...rest, sourcemap });

  if (watch) {
    let fixtureFiles = getFixtureFiles(watch);

    let debounce: Timer | null = null;
    let pending = false;

    const rebuild = async () => {
      if (pending) return;
      pending = true;
      output = await Bun.build({ ...rest, sourcemap });

      // Refresh fixture list in case new files were added
      fixtureFiles = getFixtureFiles(watch);

      onRebuild && onRebuild(output);
      pending = false;
      console.log(`[Bun-Cosmos] Rebuilt at ${new Date().toLocaleTimeString()}`);
    };

    // Watch the main directory
    fs.watch(watch, { recursive: true }, (event, filename) => {
      if (!filename) return;
      const source = absolute(join(watch, filename));

      // Only rebuild if it's a fixture file
      if (fixtureFiles.has(source)) {
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(rebuild, 50);
      }
    });

    // Watch extra files individually
    for (const file of extraWatchFiles) {
      const absFile = absolute(file);
      if (fs.existsSync(absFile)) {
        fs.watch(absFile, (event, filename) => {
          console.log(`[Bun-Cosmos] Detected change in config: ${file}`);
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(rebuild, 50);
        });
      } else {
        console.warn(`[Bun-Cosmos] Warning: extraWatchFile not found: ${file}`);
      }
    }

    console.log(`[Bun-Cosmos] Watching for changes in: ${watch} and [${extraWatchFiles.join(", ")}]`);
  }

  console.log(`[Bun-Cosmos] Built at ${new Date().toLocaleTimeString()}`);
  return output;
}