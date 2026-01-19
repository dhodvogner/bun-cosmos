import { serve, type Server } from "bun";
import { rm } from "node:fs/promises";
import { startDevServer } from "react-cosmos/dist/devServer/startDevServer.js";
import { build } from "./watch-build";
import { resolveConfig } from "./config";
import type { BunCosmosConfig, ResolvedBunCosmosConfig } from "./types";

/**
 * Main Bun-Cosmos class that manages all servers and build processes
 */
export class BunCosmos {
  private config: ResolvedBunCosmosConfig;
  private proxyServer?: Server<any>;

  constructor(config: BunCosmosConfig = {}) {
    this.config = resolveConfig(config);
  }

  /**
   * Build the Cosmos renderer
   */
  private async buildRenderer() {
    const { outdir, rendererEntry, plugins, fixturesDir, extraWatchFiles, sourcemap } = this.config;

    await rm(outdir, { recursive: true, force: true });

    await build({
      entrypoints: [rendererEntry],
      outdir,
      sourcemap,
      plugins,
      watch: fixturesDir,
      extraWatchFiles,
      onRebuild: (output) => {
        if (this.proxyServer) {
          console.log("[Bun-Cosmos] ♻️  Rebuild complete -> Triggering HMR");
          this.proxyServer.publish("hmr", "reload");
        }
      },
    });
  }

  /**
   * Start the Asset Server that serves built renderer files
   */
  private startAssetServer() {
    const { ports, outdir, cosmosHtml } = this.config;

    serve({
      port: ports.assets,
      development: this.config.development,
      async fetch(req) {
        const url = new URL(req.url);

        // Serve the Wrapper HTML
        if (url.pathname === "/cosmos.html") {
          return new Response(Bun.file(cosmosHtml));
        }

        // Serve any file found in outdir directly
        const filePath = outdir + url.pathname;
        const file = Bun.file(filePath);

        if (await file.exists()) {
          return new Response(file);
        }

        return new Response("Asset not found", { status: 404 });
      },
    });

    console.log(`[Bun-Cosmos] 📦 Assets serving at http://localhost:${ports.assets}`);
  }

  /**
   * Start the main Proxy Server that ties everything together
   */
  private startProxyServer() {
    const { ports } = this.config;

    this.proxyServer = serve({
      port: ports.proxy,
      development: this.config.development,
      websocket: {
        message(ws, message) {},
        open(ws) {
          ws.subscribe("hmr");
        },
      },
      async fetch(req) {
        const url = new URL(req.url);

        // WebSocket for HMR
        if (url.pathname === "/cosmos-ws") {
          if (this.proxyServer?.upgrade(req)) return;
          return new Response("Upgrade failed", { status: 500 });
        }

        // Proxy Renderer Requests to Asset Server
        const rendererFiles = [
          "/_renderer.html",
          "/cosmos.renderer.js",
          "/cosmos.renderer.css",
        ];

        if (rendererFiles.includes(url.pathname) || url.pathname.endsWith(".map")) {
          const targetPath =
            url.pathname === "/_renderer.html" ? "/cosmos.html" : url.pathname;
          return fetch(`http://localhost:${ports.assets}${targetPath}`);
        }

        // Proxy Everything Else to Cosmos UI
        const proxyUrl = new URL(req.url);
        proxyUrl.port = ports.ui.toString();

        const proxyReq = new Request(proxyUrl.toString(), req);
        const proxyRes = await fetch(proxyReq);

        // Inject HMR Script into the Main Dashboard
        if (
          url.pathname === "/" &&
          proxyRes.headers.get("content-type")?.includes("text/html")
        ) {
          let html = await proxyRes.text();

          const hmrScript = `
          <script>
            (function() {
              console.log("[Bun-Cosmos] 🔌 Connecting to HMR...");
              const ws = new WebSocket("ws://" + location.host + "/cosmos-ws");
              ws.onopen = () => console.log("[Bun-Cosmos] ✅ HMR Connected");
              ws.onmessage = (event) => {
                if (event.data === "reload") {
                  console.log("[Bun-Cosmos] ⚡ Fixtures changed. Reloading...");
                  window.location.reload();
                }
              };
            })();
          </script>
        `;

          return new Response(html.replace("</body>", `${hmrScript}</body>`), {
            headers: proxyRes.headers,
          });
        }

        return proxyRes;
      },
    });

    console.log(`\n---------------------------------------------------------`);
    console.log(
      `[Bun-Cosmos] 🚀 READY! Open this URL: http://localhost:${ports.proxy}`
    );
    console.log(`---------------------------------------------------------\n`);
  }

  /**
   * Start all servers and build processes
   */
  async start() {
    try {
      // Start Cosmos Manager UI
      await startDevServer("web");

      // Start Asset Server
      this.startAssetServer();

      // Build Renderer & Start Watcher
      await this.buildRenderer();

      // Start the Proxy Server
      this.startProxyServer();
    } catch (err) {
      console.error("[Bun-Cosmos] Failed to start:", err);
      throw err;
    }
  }

  /**
   * Stop all servers (if needed in the future)
   */
  async stop() {
    if (this.proxyServer) {
      this.proxyServer.stop();
    }
  }
}

/**
 * Convenience function to start Bun-Cosmos with a single call
 * 
 * @example
 * ```typescript
 * import { startBunCosmos } from "bun-cosmos";
 * 
 * await startBunCosmos({
 *   ports: { proxy: 3000 },
 *   plugins: [tailwindPlugin()],
 * });
 * ```
 */
export async function startBunCosmos(config: BunCosmosConfig = {}) {
  const bunCosmos = new BunCosmos(config);
  await bunCosmos.start();
  return bunCosmos;
}

// Export types
export type { BunCosmosConfig, ResolvedBunCosmosConfig } from "./types";
export { resolveConfig } from "./config";
