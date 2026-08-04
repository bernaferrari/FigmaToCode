# Figma plugin app

This app bundles the plugin controller and React UI into the files loaded by the repository-level [`manifest.json`](../../manifest.json).

## Requirements

- Node.js `>=24`
- pnpm `^11`

Install dependencies from the repository root:

```sh
pnpm install
```

Build the plugin once:

```sh
pnpm --filter plugin build
```

For development, run the watchers:

```sh
pnpm --filter plugin dev
```

Then import the repository's `manifest.json` as a development plugin in Figma. Controller code lives in `plugin-src/`; the UI entry point is `ui-src/main.tsx`; compiled output is written to `dist/`.

Run `pnpm build`, `pnpm lint`, `pnpm format:check`, and `pnpm test` from the repository root before publishing.
