# send-current-tab-to-metube

Adds a button to send the current page's URL to a self-hosted MeTube instance for downloading.

## Development

```sh
pnpm dev
```

This starts a local Vite dev server via [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey). Add the served URL to [ViolentMonkey](https://violentmonkey.github.io/) as a local script to get live reloading while you work.

> **Note:** Browsers block the locally served script due to Content Security Policy (CSP). You will need to disable CSP in your browser while developing — for example, in Firefox use an extension such as [Disable CSP for a minute](https://addons.mozilla.org/en-US/firefox/addon/disable-csp-for-a-minute/). Built scripts do not have this limitation.
>
> **Note:** `pnpm dev` will not work correctly because `GM_config` is loaded via `@require` and is only available on the userscript manager's global scope, which the Vite dev server does not provide. Use `pnpm build` and install the built `.user.js` file instead.

## Building

```sh
pnpm build
```

Outputs the final `*.user.js` to the `dist/` directory, ready to install in any userscript manager.
