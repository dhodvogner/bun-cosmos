import { startBunCosmos } from "../src/index";

// Example: Start Bun-Cosmos with custom configuration
await startBunCosmos({
  fixturesDir: "./example/fixtures",
  ports: {
    proxy: 3009, // Main port to open in browser
  },
  // Example: Add Bun plugins if needed
  // plugins: [tailwindPlugin()],
});
