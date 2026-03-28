# CLAUDE.md

## Tooling

- **mise** manages tool versions (`mise.toml`). Node.js version is pinned there.
- **PNPM** is the package manager (`packageManager` field in `package.json`). Run `pnpm install` from the root.

## Monorepo structure

- Packages live under `packages/`. Each is a standalone userscript project.
- PNPM workspaces (`pnpm-workspace.yaml`) link them together.
- Shared dependency versions are declared in the `catalog:` section of `pnpm-workspace.yaml`. Packages reference them with `"catalog:"` as the version specifier — always use the catalog for dependencies that appear in more than one package.

## Each package

- Built with **Vite** + **vite-plugin-monkey**, which wraps the output as a `.user.js` userscript.
- `pnpm dev` — starts a local dev server; add the served URL to ViolentMonkey as a local script. Requires CSP to be disabled in the browser (dev mode only).
- `pnpm build` — outputs the final `*.user.js` to `dist/`.
- Userscripts should use native browser APIs over GreaseMonkey-specific ones where possible.
