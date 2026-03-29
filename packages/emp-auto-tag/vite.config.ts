import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import rootPkg from "../../package.json" with { type: "json" };
import pkg from "./package.json" with { type: "json" };

// Derive package directory name from this file's URL (e.g. "emp-auto-tag")
const packageDir = import.meta.url.split("/").at(-2);
const downloadURL = `${rootPkg.homepage}/${packageDir}/${packageDir}.user.js`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "EMP Auto Tag",
        version: pkg.version,
        namespace: "https://github.com/CoolMintChocolate",
        require: ["https://openuserjs.org/src/libs/sizzle/GM_config.js"],
        match: ["https://www.empornium.sx/*"],
        downloadURL,
        updateURL: downloadURL,
      },
    }),
  ],
});
