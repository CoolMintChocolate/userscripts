# send-current-tab-to-metube

Adds a button to send the current page's URL to a self-hosted MeTube instance for downloading.

## Development

```sh
pnpm dev
```

This starts a local Vite dev server via [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey). Add the served URL to [TamperMonkey](https://www.tampermonkey.net/) as a local script to get live reloading while you work.

> **Note:** Browsers block the locally served script due to Content Security Policy (CSP). You will need to disable CSP in your browser while developing — for example, in Firefox use an extension such as [Disable CSP for a minute](https://addons.mozilla.org/en-US/firefox/addon/disable-csp-for-a-minute/). Built scripts do not have this limitation.

## Building

```sh
pnpm build
```

Outputs the final `*.user.js` to the `dist/` directory, ready to install in any userscript manager.
