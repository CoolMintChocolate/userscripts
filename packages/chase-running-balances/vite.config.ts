import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import rootPkg from "../../package.json" with { type: "json" };
import pkg from "./package.json" with { type: "json" };

// Derive package directory name from this file's URL (e.g. "chase-running-balances")
const packageDir = import.meta.url.split("/").at(-2);
const downloadURL = `${rootPkg.homepage}/${packageDir}/${packageDir}.user.js`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "Chase Running Balances",
        version: pkg.version,
        icon: "https://www.chase.com/apple-touch-icon.png",
        namespace: "https://github.com/CoolMintChocolate",
        match: ["https://secure.chase.com/web/auth/dashboard*"],
        downloadURL,
      },
    }),
  ],
});
