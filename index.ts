import { serve, type Server } from "bun";
import { rm } from "node:fs/promises";

import { startDevServer } from 'react-cosmos/dist/devServer/startDevServer.js';

import { build } from "./watch-build";

// --- Configuration ---
const PORTS = {
  UI: 5000,      // Cosmos Manager (hidden)
  ASSETS: 3008,  // Renderer Assets (hidden)
  PROXY: 3009    // <--- OPEN THIS ONE
};

// Global reference for the Proxy Server (to send HMR signals)
// "Server<any>" fixes the TypeScript error you saw
let proxyServer: Server<any>;

// 1. Build The Renderer
async function buildRenderer() {
  await rm("./cosmos/out", { recursive: true, force: true });

  await build({
    entrypoints: ["./cosmos/cosmos.renderer.tsx"],
    outdir: "./cosmos/out",
    sourcemap: "external",
    plugins: [],
    watch: "./examples", // <--- WATCH THE EXAMPLES FOLDER
    extraWatchFiles: ["./cosmos.imports.js"],
    onRebuild(output) {
      if (proxyServer) {
        console.log("[Bun-Cosmos] ♻️  Rebuild complete -> Triggering HMR");
        proxyServer.publish("hmr", "reload");
      }
    },
  });
}

// 2. Start the Asset Server (Port 3008)
// This strictly serves files. No logic, no proxies.
function startAssetServer() {
  serve({
    port: PORTS.ASSETS,
    development: true,
    async fetch(req) {
      const url = new URL(req.url);

      // Serve the Wrapper HTML
      if (url.pathname === "/cosmos.html") {
        return new Response(Bun.file("./cosmos/cosmos.html"));
      }

      // Serve any file found in /cosmos/out/ DIRECTLY
      // Example: Request to "/cosmos.renderer.js" -> looks in "./cosmos/out/cosmos.renderer.js"
      const filePath = "./cosmos/out" + url.pathname;
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return new Response(file);
      }

      return new Response("Asset not found", { status: 404 });
    }
  });
  console.log(`[Bun-Cosmos] 📦 Assets serving at http://localhost:${PORTS.ASSETS}`);
}

// 3. Start the Main Proxy (Port 3009)
// This ties everything together.
function startProxyServer() {
  proxyServer = serve({
    port: PORTS.PROXY,
    development: true,
    websocket: {
      message(ws, message) { },
      open(ws) { ws.subscribe("hmr"); },
    },
    async fetch(req) {
      const url = new URL(req.url);

      // --- A: WebSocket for HMR ---
      if (url.pathname === "/cosmos-ws") {
        if (proxyServer.upgrade(req)) return;
        return new Response("Upgrade failed", { status: 500 });
      }

      // --- B: Proxy Renderer Requests to Asset Server (3008) ---
      // We explicitly route the renderer HTML and its known assets
      const rendererFiles = ["/_renderer.html", "/cosmos.renderer.js", "/cosmos.renderer.css"];

      // Check if it's a known renderer file OR a sourcemap
      if (rendererFiles.includes(url.pathname) || url.pathname.endsWith(".map")) {
        // Map /_renderer.html to /cosmos.html on the asset server
        const targetPath = url.pathname === "/_renderer.html" ? "/cosmos.html" : url.pathname;

        // Proxy to Port 3008
        return fetch(`http://localhost:${PORTS.ASSETS}${targetPath}`);
      }

      // --- C: Proxy Everything Else to Cosmos UI (5000) ---
      const proxyUrl = new URL(req.url);
      proxyUrl.port = PORTS.UI.toString();

      const proxyReq = new Request(proxyUrl.toString(), req);
      const proxyRes = await fetch(proxyReq);

      // --- D: Inject HMR Script into the Main Dashboard ---
      // We inject this only into the main UI HTML, not the renderer iframe
      if (url.pathname === "/" && proxyRes.headers.get("content-type")?.includes("text/html")) {
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
  console.log(`[Bun-Cosmos] 🚀 READY! Open this URL: http://localhost:${PORTS.PROXY}`);
  console.log(`---------------------------------------------------------\n`);
}

async function start() {
  // Start Cosmos (Standard Manager UI)
  await startDevServer("web").catch((err) => {
    console.error("Failed to start React Cosmos dev server:", err);
    process.exit(1);
  });

  // Start Asset Server
  startAssetServer();

  // Build Renderer & Start Watcher
  // We start this *after* servers are up so onRebuild works immediately
  buildRenderer().catch((err) => {
    console.error("Failed to build Cosmos renderer:", err);
    process.exit(1);
  });

  // Start the Proxy
  startProxyServer();
}

start();