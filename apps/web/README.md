# Interface lab and product showcase

This Next.js app presents Figma to Code in a browser and doubles as a visual test harness for the shared plugin UI. Its focused preview supports light and dark themes plus ready, warning, and empty states without reopening Figma.

## Requirements

- Node.js `>=24`
- pnpm `^11`

Install dependencies from the repository root:

```sh
pnpm install
```

Start only the website:

```sh
pnpm --filter web dev
```

Open <http://localhost:3000>. Use the preview controls to change the theme and UI state, then switch frameworks inside the plugin. The page entry point is [`app/page.tsx`](app/page.tsx), page styling is in [`styles/globals.css`](styles/globals.css), and the reusable plugin interface lives in `packages/plugin-ui`.

## Production check

```sh
pnpm --filter web build
```

Run `pnpm build`, `pnpm lint`, `pnpm format:check`, and `pnpm test` from the repository root before publishing changes that affect shared packages.
