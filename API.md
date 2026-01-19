# API Documentation

## Table of Contents

- [Main Functions](#main-functions)
  - [startBunCosmos](#startbuncosmos)
- [Classes](#classes)
  - [BunCosmos](#buncosmos)
- [Configuration](#configuration)
  - [BunCosmosConfig](#buncosmosconfig)
  - [ResolvedBunCosmosConfig](#resolvedbuncosmosconfig)
- [Utility Functions](#utility-functions)
  - [resolveConfig](#resolveconfig)

---

## Main Functions

### startBunCosmos

Convenience function to start Bun-Cosmos with a single call.

```typescript
function startBunCosmos(config?: BunCosmosConfig): Promise<BunCosmos>
```

**Parameters:**
- `config` (optional): Configuration options for Bun-Cosmos

**Returns:**
- `Promise<BunCosmos>`: Resolves with the BunCosmos instance

**Example:**

```typescript
import { startBunCosmos } from "bun-cosmos";

await startBunCosmos({
  ports: { proxy: 3000 },
  fixturesDir: "./src/components",
  plugins: [tailwindPlugin()],
});
```

---

## Classes

### BunCosmos

Main class that manages all servers and build processes.

#### Constructor

```typescript
constructor(config?: BunCosmosConfig)
```

**Parameters:**
- `config` (optional): Configuration options

**Example:**

```typescript
import { BunCosmos } from "bun-cosmos";

const cosmos = new BunCosmos({
  ports: { proxy: 3000 },
  fixturesDir: "./src",
});
```

#### Methods

##### start()

Starts all servers and build processes.

```typescript
async start(): Promise<void>
```

**Example:**

```typescript
const cosmos = new BunCosmos();
await cosmos.start();
```

##### stop()

Stops all servers.

```typescript
async stop(): Promise<void>
```

**Example:**

```typescript
await cosmos.stop();
```

---

## Configuration

### BunCosmosConfig

Configuration interface for Bun-Cosmos.

```typescript
interface BunCosmosConfig {
  ports?: {
    ui?: number;
    assets?: number;
    proxy?: number;
  };
  fixturesDir?: string;
  outdir?: string;
  rendererEntry?: string;
  cosmosHtml?: string;
  plugins?: BunPlugin[];
  extraWatchFiles?: string[];
  sourcemap?: "none" | "inline" | "external";
  development?: boolean;
  cosmosConfigPath?: string;
}
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ports` | `object` | `{ ui: 5000, assets: 3008, proxy: 3009 }` | Port configuration for servers |
| `ports.ui` | `number` | `5000` | Port for Cosmos Manager UI (internal) |
| `ports.assets` | `number` | `3008` | Port for Renderer Assets server (internal) |
| `ports.proxy` | `number` | `3009` | Port for main proxy server (open in browser) |
| `fixturesDir` | `string` | `"./examples"` | Directory containing fixture files |
| `outdir` | `string` | `"./cosmos/out"` | Output directory for built renderer |
| `rendererEntry` | `string` | `"./cosmos/cosmos.renderer.tsx"` | Path to renderer entry point |
| `cosmosHtml` | `string` | `"./cosmos/cosmos.html"` | Path to cosmos.html wrapper |
| `plugins` | `BunPlugin[]` | `[]` | Bun build plugins (e.g., tailwind) |
| `extraWatchFiles` | `string[]` | `["./cosmos.imports.js"]` | Additional files to watch |
| `sourcemap` | `"none" \| "inline" \| "external"` | `"external"` | Source map configuration |
| `development` | `boolean` | `true` | Enable development mode |
| `cosmosConfigPath` | `string` | `undefined` | Custom cosmos.config.json path |

#### Examples

**Minimal Configuration:**

```typescript
await startBunCosmos({
  fixturesDir: "./src",
});
```

**Full Configuration:**

```typescript
import tailwindPlugin from "bun-plugin-tailwind";

await startBunCosmos({
  ports: {
    ui: 5001,
    assets: 3010,
    proxy: 3000,
  },
  fixturesDir: "./src/components",
  outdir: "./dist/cosmos",
  rendererEntry: "./cosmos/renderer.tsx",
  cosmosHtml: "./cosmos/index.html",
  plugins: [tailwindPlugin()],
  extraWatchFiles: ["./cosmos.imports.js", "./tailwind.config.js"],
  sourcemap: "external",
  development: true,
});
```

### ResolvedBunCosmosConfig

Resolved configuration with all defaults applied. This is the internal type used after configuration resolution.

```typescript
interface ResolvedBunCosmosConfig {
  ports: {
    ui: number;
    assets: number;
    proxy: number;
  };
  fixturesDir: string;
  outdir: string;
  rendererEntry: string;
  cosmosHtml: string;
  plugins: BunPlugin[];
  extraWatchFiles: string[];
  sourcemap: "none" | "inline" | "external";
  development: boolean;
  cosmosConfigPath?: string;
}
```

---

## Utility Functions

### resolveConfig

Resolves user configuration with defaults.

```typescript
function resolveConfig(userConfig?: BunCosmosConfig): ResolvedBunCosmosConfig
```

**Parameters:**
- `userConfig` (optional): User configuration

**Returns:**
- `ResolvedBunCosmosConfig`: Configuration with all defaults applied

**Example:**

```typescript
import { resolveConfig } from "bun-cosmos";

const config = resolveConfig({
  ports: { proxy: 3000 },
});

console.log(config.ports.ui); // 5000 (default)
console.log(config.ports.proxy); // 3000 (custom)
```

---

## Type Exports

All types are exported from the main module:

```typescript
import type {
  BunCosmosConfig,
  ResolvedBunCosmosConfig,
} from "bun-cosmos";
```

---

## Advanced Usage Examples

### Using with Multiple Build Plugins

```typescript
import { startBunCosmos } from "bun-cosmos";
import tailwindPlugin from "bun-plugin-tailwind";
import customPlugin from "./my-plugin";

await startBunCosmos({
  plugins: [
    tailwindPlugin(),
    customPlugin(),
  ],
});
```

### Programmatic Control

```typescript
import { BunCosmos } from "bun-cosmos";

const cosmos = new BunCosmos({
  fixturesDir: "./src",
});

// Start
await cosmos.start();

// Do something...

// Stop when done
await cosmos.stop();
```

### Custom Port Configuration

```typescript
await startBunCosmos({
  ports: {
    ui: 5001,      // Change if port 5000 is in use
    assets: 3010,  // Change if port 3008 is in use
    proxy: 3000,   // The port you'll access in browser
  },
});
```

---

## Notes

- All paths in configuration are relative to the current working directory
- The proxy server is the only one you need to access (defaults to port 3009)
- Fixture files must have `.fixture.ts` or `.fixture.tsx` extension
- Hot reload automatically triggers when fixture files change
- Source maps are enabled by default for debugging
