# bun-cosmos

A drop-in Bun library for running [React Cosmos](https://reactcosmos.org/) with custom bundler support. Perfect for visual testing and component development in Bun-based React projects.

## Why bun-cosmos?

When using Bun as your bundler, popular UI sandboxes like Storybook don't work out of the box. React Cosmos is a great alternative that supports custom bundlers, but setting it up requires configuration. **bun-cosmos** provides a zero-config solution that just works.

## Features

- 🚀 **Drop-in solution** - Add one dependency and start developing
- ⚡ **Fast rebuilds** - Powered by Bun's blazing-fast bundler
- 🔄 **Hot Module Replacement** - Automatic browser reload on changes
- 🔌 **Plugin support** - Use Bun plugins like `bun-plugin-tailwind`
- 🎯 **TypeScript native** - Written in TypeScript, runs natively with Bun
- ⚙️ **Highly configurable** - Customize ports, paths, and build options
- 📦 **Unified interface** - Everything served on one port

## Installation

```bash
bun add -d bun-cosmos
```

## Quick Start

### 1. Create your Cosmos setup

Create a `cosmos` directory in your project root:

```
your-project/
├── cosmos/
│   ├── cosmos.html
│   └── cosmos.renderer.tsx
├── cosmos.config.json
└── your-components/
```

**cosmos/cosmos.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Component Library</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./cosmos.renderer.js"></script>
</body>
</html>
```

**cosmos/cosmos.renderer.tsx:**
```tsx
import { mountDomRenderer } from 'react-cosmos-dom';
// @ts-ignore
import * as mountArgs from '../cosmos.imports';

mountDomRenderer(mountArgs);
```

**cosmos.config.json:**
```json
{
  "$schema": "http://json.schemastore.org/cosmos-config",
  "rendererUrl": "http://localhost:3008/cosmos.html",
  "port": 5000,
  "exposeImports": true,
  "watchDirs": ["./src"]
}
```

### 2. Create a start script

Create a file (e.g., `cosmos.ts`) in your project root:

```typescript
import { startBunCosmos } from "bun-cosmos";

await startBunCosmos({
  fixturesDir: "./src", // Where your .fixture.tsx files are
  ports: {
    proxy: 3009, // The port you'll open in your browser
  },
});
```

### 3. Create fixture files

Create fixture files for your components (e.g., `src/Button.fixture.tsx`):

```tsx
function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}

export default {
  'Primary': <Button label="Click me!" />,
  'Secondary': <Button label="Cancel" />,
}
```

### 4. Start the development server

```bash
bun run cosmos.ts
```

Open http://localhost:3009 in your browser! 🎉

## Configuration

### BunCosmosConfig Options

```typescript
interface BunCosmosConfig {
  /**
   * Port configuration for the servers
   * @default { ui: 5000, assets: 3008, proxy: 3009 }
   */
  ports?: {
    ui?: number;      // Cosmos Manager UI (internal)
    assets?: number;  // Renderer Assets server (internal)
    proxy?: number;   // Main proxy server (open this in browser)
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
   */
  plugins?: BunPlugin[];

  /**
   * Additional files to watch for changes
   * @default ["./cosmos.imports.js"]
   */
  extraWatchFiles?: string[];

  /**
   * Enable source maps for debugging
   * @default "external"
   */
  sourcemap?: "none" | "inline" | "external";

  /**
   * Development mode settings
   * @default true
   */
  development?: boolean;
}
```

## Advanced Usage

### Using with Tailwind CSS

```typescript
import { startBunCosmos } from "bun-cosmos";
import tailwind from "bun-plugin-tailwind";

await startBunCosmos({
  plugins: [tailwind],
  fixturesDir: "./src/components",
});
```

**Important:** Import your Tailwind CSS in the renderer:

```tsx
// cosmos/cosmos.renderer.tsx
import { mountDomRenderer } from 'react-cosmos-dom';
import '../src/index.css'; // Your Tailwind CSS
// @ts-ignore
import * as mountArgs from '../cosmos.imports';

mountDomRenderer(mountArgs);
```

### Custom Ports

```typescript
await startBunCosmos({
  ports: {
    ui: 5001,      // Internal Cosmos UI
    assets: 3010,  // Internal asset server
    proxy: 3000,   // Your main port
  },
});
```

### Multiple Watch Directories

Update your `cosmos.config.json`:

```json
{
  "watchDirs": ["./src/components", "./src/pages"]
}
```

### Using the Class API

For more control, use the `BunCosmos` class directly:

```typescript
import { BunCosmos } from "bun-cosmos";

const cosmos = new BunCosmos({
  fixturesDir: "./src",
});

await cosmos.start();

// Later, if needed:
await cosmos.stop();
```

[API Documentation](./API.md)

## How It Works

bun-cosmos orchestrates three servers:

1. **Cosmos UI Server** (port 5000) - The React Cosmos manager interface
2. **Asset Server** (port 3008) - Serves your built renderer bundle
3. **Proxy Server** (port 3009) - Combines everything and adds HMR

You only interact with the Proxy Server, which:
- Routes UI requests to Cosmos
- Routes renderer requests to the Asset Server
- Injects HMR WebSocket for live reloading
- Watches your fixtures and rebuilds automatically

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` errors, change the ports:

```typescript
await startBunCosmos({
  ports: { proxy: 3010 },
});
```

### Fixtures Not Found

Make sure your `cosmos.config.json` `watchDirs` matches your `fixturesDir`:

```typescript
// If your fixtures are in ./src/components
await startBunCosmos({
  fixturesDir: "./src/components",
});
```

And in `cosmos.config.json`:
```json
{
  "watchDirs": ["./src/components"]
}
```

### Hot Reload Not Working

Ensure:
1. Your fixtures have the `.fixture.tsx` or `.fixture.ts` extension
2. The `fixturesDir` matches where your fixtures are located
3. The browser console shows "HMR Connected"

## Examples

Check the [example/](./example) directory for a complete working example.

## Requirements

- Bun v1.0.0 or later
- React 18+ or React 19+
- TypeScript 5+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE)

## Credits

- Built on top of [React Cosmos](https://reactcosmos.org/)
- Watch-build implementation inspired by [@dpeek](https://github.com/oven-sh/bun/issues/5866#issuecomment-2691700945)

## Related Projects

- [React Cosmos](https://reactcosmos.org/) - The underlying component development tool
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime

