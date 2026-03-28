import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "Amex Running Balances",
        icon: "https://www.americanexpress.com/content/dam/amex/us/merchant/supplies-uplift/product/images/img-WEBLOGO1-01.jpg",
        namespace: "https://github.com/CoolMintChocolate",
        match: ["https://global.americanexpress.com/activity*"],
      },
    }),
  ],
});
