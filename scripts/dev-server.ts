import type { RollupWatcher } from "rollup";
import { build, preview } from "vite";

const watcher = (await build({ build: { watch: {} } })) as RollupWatcher;

// Wait for the first build to complete before starting the server
await new Promise<void>((resolve) => {
  watcher.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      event.result.close();
    }
    if (event.code === "END") {
      resolve();
    }
  });
});

const server = await preview();
server.printUrls();
server.bindCLIShortcuts({ print: true });

// Log on subsequent rebuilds
watcher.on("event", (event) => {
  if (event.code === "BUNDLE_END") {
    console.log(`Rebuilt in ${event.duration}ms`);
    event.result.close();
  }
});
