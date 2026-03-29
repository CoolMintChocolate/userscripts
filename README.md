# userscripts

[![Userscripts](https://img.shields.io/badge/Userscripts-Install-blue)](https://coolmintchocolate.github.io/userscripts/)

A monorepo of personal userscripts, each built with [Vite](https://vitejs.dev/) and [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey).

## Packages

| Package | Description |
|---|---|
| [Amex Running Balances](packages/amex-running-balances) | Shows a running balance after each transaction on the AMEX account activity page |
| [Chase Running Balances](packages/chase-running-balances) | Adds a running balance column to Chase bank transaction lists. |
| [Send current tab to MeTube](packages/send-current-tab-to-metube) | Adds a button to send the current page's URL to a self-hosted MeTube instance for downloading. |
| [EMP Send torrent to Deluge](packages/emp-send-torrent-to-deluge) | Adds a button on EMP torrent pages to send torrents directly to your Deluge torrent client. |

## Development

Each package supports a live-reload dev server that serves the userscript locally:

```sh
cd packages/<package-name>
pnpm dev
```

Then add the served URL to [TamperMonkey](https://www.tampermonkey.net/) as a local script.

> **Note:** In dev mode the script is served from `localhost`, which browsers block due to Content Security Policy (CSP). You will need to disable CSP while developing — for example, in Firefox use an extension such as [Disable CSP for a minute](https://addons.mozilla.org/en-US/firefox/addon/disable-csp-for-a-minute/). This is only required during development; built scripts are not affected.

## Building

To build the final userscript for a package:

```sh
cd packages/<package-name>
pnpm build
```

The compiled `.user.js` file will be output to the `dist/` directory.
