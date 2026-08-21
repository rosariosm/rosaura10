# rosaura10

three.js things, in versions. Each version is its own small app; they are built together and deployed as one site.

- **v1** — *Pa que te voy a decir que no si sí*. The original: two boxes you can hover and click, and cloud-textured text tumbling through the scene. Made just to have fun 'u'.
- **v2** — the new one. Currently a placeholder scene: a wireframe cube and a hello world.

Live at **https://rosariosm.github.io/rosaura10/**

## Requirements

Node **24** (see `.nvmrc`). If you use `fnm` or `nvm`, `fnm use` / `nvm use` in this directory picks it up.

v1 originally ran on Node 14 with create-react-app. It was ported to Vite and current React/three so everything runs on one modern toolchain — the animation is unchanged, only the plumbing moved. See `docs/architecture.md` in [synthsaura](https://github.com/rosariosm/synthsaura) for why.

## Running it

```sh
npm install     # installs every version, via workspaces
npm run dev:v1  # http://localhost:5173/rosaura10/v1/
npm run dev:v2  # http://localhost:5174/rosaura10/v2/
```

Each version has its own fixed port, so both can run at once. The dev URL also
includes the version's path, because each app's `base` matches where GitHub Pages
serves it from — dev and production resolve assets the same way.

Vite prints the full URL on start; use that rather than typing one. Visiting a
path on the wrong port gives you a "server is configured with a public base URL
of ..." error, which means that port belongs to the other version.

## Building

```sh
npm run build   # builds each version, then assembles dist/
npm run serve   # serve dist/ locally
```

`npm run build` produces:

```
dist/
├── index.html   the hub page (from public/)
├── v1/          the original animation
└── v2/          the new one
```

Note that `npm run serve` serves `dist/` at the server root, while the built assets expect a `/rosaura10/` prefix. To check the real thing locally, copy `dist` into a folder named `rosaura10` and serve its parent.

## Deploying

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. **This requires Settings → Pages → Source to be set to "GitHub Actions"** — deploys fail until that is done, and it cannot be set from the workflow.

## Adding a version

1. Create `v3/` as its own Vite app, with `base: "/rosaura10/v3/"` in its `vite.config.js`.
2. Add `"v3"` to `workspaces` in the root `package.json`, plus a `dev:v3` script. The
   root `build` script uses `--workspaces`, so it picks the new app up on its own.
3. Add `"v3"` to `VERSIONS` in `scripts/assemble.mjs`.
4. Add an entry to the list in `public/index.html`.
