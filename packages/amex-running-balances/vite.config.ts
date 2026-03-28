import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import rootPkg from "../../package.json" with { type: "json" };
import pkg from "./package.json" with { type: "json" };

// Derive package directory name from this file's URL (e.g. "amex-running-balances")
const packageDir = import.meta.url.split("/").at(-2);
const downloadURL = `${rootPkg.homepage}/${packageDir}/${packageDir}.user.js`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "Amex Running Balances",
        version: pkg.version,
        icon: "https://www.americanexpress.com/content/dam/amex/us/merchant/supplies-uplift/product/images/img-WEBLOGO1-01.jpg",
        namespace: "https://github.com/CoolMintChocolate",
        match: ["https://global.americanexpress.com/activity*"],
        downloadURL,
      },
    }),
  ],
});
