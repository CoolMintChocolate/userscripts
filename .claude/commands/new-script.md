Ask the user for the human-readable name of the new userscript (e.g. "My Cool Script"). From that, derive the slug by lowercasing and replacing spaces with hyphens (e.g. "my-cool-script"). The slug will be used as the package directory name under `packages/` and as the script filename.

Then bootstrap the new package by performing all of the following steps:

1. Create the directory `packages/<slug>/src/`.

2. Create `packages/<slug>/package.json` by copying from `packages/amex-running-balances/package.json`, but:
   - Set `"name"` to the slug
   - Set `"version"` to `"0.0.0"`

3. Copy `packages/amex-running-balances/tsconfig.json` verbatim to `packages/<slug>/tsconfig.json`.

4. Copy `packages/amex-running-balances/src/vite-env.d.ts` verbatim to `packages/<slug>/src/vite-env.d.ts`.

5. Create `packages/<slug>/vite.config.ts` by copying from `packages/amex-running-balances/vite.config.ts`, but:
   - Set the `name` field inside `userscript` to the human-readable name the user provided
   - Remove the `icon` and `match` fields from `userscript`, as these are script-specific and the user should fill them in
   - Leave everything else (version, downloadURL, namespace) as-is since they are derived dynamically

6. Create an empty `packages/<slug>/src/main.ts` file.

7. Create `packages/<slug>/README.md` using the same structure as `packages/amex-running-balances/README.md`, but:
   - Replace the title and description with the human-readable name and a placeholder description
   - Remove the "How it works" section entirely, as it is script-specific
   - Keep the Development and Building sections verbatim

8. Add a row for the new package to the packages table in the root `README.md`. The row should follow the same format as existing entries: `| [<human-readable name>](packages/<slug>) | <placeholder description> |`. Insert it after the last existing row in the table.

9. Run `pnpm install` from the repo root so the new package is linked into the workspace.

After all steps complete, tell the user:
- The path to the new package
- That they should fill in `match` (and optionally `icon`) in `vite.config.ts`, and update the placeholder descriptions in both the package `README.md` and the root `README.md`
- That they can start developing with `pnpm dev` from the package directory
