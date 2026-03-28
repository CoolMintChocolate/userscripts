# amex-running-balances

A userscript that displays a running balance after each transaction on the [American Express account activity page](https://global.americanexpress.com/activity).

## How it works

1. Reads the **Total Balance** and **Pending Charges** from the page header and adds them together.
2. Walks through each transaction from top to bottom, subtracting each amount from the running total.
3. Injects the running balance in italics below each transaction amount.

## Development

```sh
pnpm dev
```

This starts a local Vite dev server via [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey). Add the served URL to [ViolentMonkey](https://violentmonkey.github.io/) as a local script to get live reloading while you work.

> **Note:** Browsers block the locally served script due to Content Security Policy (CSP). You will need to disable CSP in your browser while developing — for example, in Firefox use an extension such as [Disable CSP for a minute](https://addons.mozilla.org/en-US/firefox/addon/disable-csp-for-a-minute/). Built scripts do not have this limitation.

## Building

```sh
pnpm build
```

Outputs the final `*.user.js` to the `dist/` directory, ready to install in any userscript manager.
