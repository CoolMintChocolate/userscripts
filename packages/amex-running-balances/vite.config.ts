import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import pkg from "./package.json" with { type: "json" };

const PAGES_BASE =
  "https://coolmintchocolate.github.io/userscripts/amex-running-balances";

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
        downloadURL: `${PAGES_BASE}/amex-running-balances.user.js`,
      },
    }),
  ],
});
