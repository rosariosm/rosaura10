# rosaura10

three.js things, in versions. Each version is its own small app; they are built together and deployed as one site.

- **v1** — *Pa que te voy a decir que no si sí*. The original: two boxes you can hover and click, and cloud-textured text tumbling through the scene. Made just to have fun 'u'.
- **v2** — not yet.

Live at **https://rosariosm.github.io/rosaura10/**

## Requirements

Node **24** (see `.nvmrc`). If you use `fnm` or `nvm`, `fnm use` / `nvm use` in this directory picks it up.

v1 originally ran on Node 14 with create-react-app. It was ported to Vite and current React/three so everything runs on one modern toolchain — the animation is unchanged, only the plumbing moved. See `docs/architecture.md` in [synthsaura](https://github.com/rosariosm/synthsaura) for why.

## Running it

```sh
npm install     # installs every version, via workspaces
npm run dev:v1  # http://localhost:5173/rosaura10/v1/
```

The dev URL includes the `/rosaura10/v1/` path because the base is set to match where GitHub Pages serves it from.

## Building

```sh
npm run build   # builds each version, then assembles dist/
npm run serve   # serve dist/ locally
```

`npm run build` produces:

```
dist/
├── index.html   the hub page (from public/)
└── v1/          the built animation
```

Note that `npm run serve` serves `dist/` at the server root, while the built assets expect a `/rosaura10/` prefix. To check the real thing locally, copy `dist` into a folder named `rosaura10` and serve its parent.

## Deploying

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. **This requires Settings → Pages → Source to be set to "GitHub Actions"** — deploys fail until that is done, and it cannot be set from the workflow.

## Adding a version

1. Create `v2/` as its own Vite app, with `base: "/rosaura10/v2/"` in its `vite.config.js`.
2. Add `"v2"` to `workspaces` in the root `package.json`, and a `dev:v2` script.
3. Add `"v2"` to `VERSIONS` in `scripts/assemble.mjs`.
4. Swap the placeholder entry in `public/index.html` for a real link.
