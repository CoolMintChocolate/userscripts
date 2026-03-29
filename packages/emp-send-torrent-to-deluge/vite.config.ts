import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import rootPkg from "../../package.json" with { type: "json" };
import pkg from "./package.json" with { type: "json" };

// Derive package directory name from this file's URL (e.g. "emp-send-torrent-to-deluge")
const packageDir = import.meta.url.split("/").at(-2);
const downloadURL = `${rootPkg.homepage}/${packageDir}/${packageDir}.user.js`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "EMP Send torrent to Deluge",
        version: pkg.version,
        namespace: "https://github.com/CoolMintChocolate",
        downloadURL,
        updateURL: downloadURL,
        require: ["https://openuserjs.org/src/libs/sizzle/GM_config.js"],
        match: [
          "https://www.empornium.sx/torrents.php*",
          "https://www.empornium.sx/top10.php*",
          "https://www.empornium.sx/collage/*",
        ],
      },
    }),
  ],
});
