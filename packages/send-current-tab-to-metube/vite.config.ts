import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import rootPkg from "../../package.json" with { type: "json" };
import pkg from "./package.json" with { type: "json" };

// Derive package directory name from this file's URL (e.g. "send-current-tab-to-metube")
const packageDir = import.meta.url.split("/").at(-2);
const downloadURL = `${rootPkg.homepage}/${packageDir}/${packageDir}.user.js`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "Send current tab to MeTube",
        version: pkg.version,
        namespace: "https://github.com/CoolMintChocolate",
        downloadURL,
        match: [
          "https://www.pornhub.com/view_video.php*",
          "https://xhamster.com/videos/*",
          "https://www.xvideos.com/video*",
          "https://www.youporn.com/watch/*",
        ],
        require: ["https://openuserjs.org/src/libs/sizzle/GM_config.js"],
        grant: ["GM.setValue", "GM.getValue"],
      },
    }),
  ],
});
