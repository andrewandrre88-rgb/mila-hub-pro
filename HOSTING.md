# Hosting

This project is built with **Bun**. Always install and build with Bun to avoid
the npm Rollup optional-binary bug (`@rollup/rollup-linux-x64-gnu` missing).

## Build command (all hosts)

```
bun install && bun run build
```

Output directory: `dist`

## Presets included

- **Netlify** — `netlify.toml`
- **Vercel** — `vercel.json`
- **Render** — `render.yaml`

## Manual setup (Cloudflare Pages, Railway, etc.)

- Install command: `bun install`
- Build command: `bun run build`
- Output / publish directory: `dist`

## Why not npm?

npm has a long-standing bug where platform-specific optional dependencies
(like Rollup's native binaries) fail to install when `package-lock.json` is
out of sync. Bun and pnpm handle this correctly.

If you must use npm, delete `package-lock.json` and `node_modules`, then run
`npm install` fresh — but Bun is recommended.
