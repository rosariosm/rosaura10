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
npm run dev:v1  # http://localhost:5173/
npm run dev:v2  # http://localhost:5174/
```

Each version has its own fixed port and is served from the root in dev, so both
can run at once and the URLs stay short. The `/rosaura10/<version>/` prefix only
exists in builds, where it has to match GitHub Pages.

## Building

```sh
npm run build   # builds each version, then assembles dist/
npm run serve   # preview at http://localhost:4173/rosaura10/
```

`npm run build` produces:

```
dist/
├── index.html   the hub page (from public/)
├── v1/          the original animation
└── v2/          the new one
```

`npm run serve` mounts `dist/` under `/rosaura10/`, exactly as Pages does. Because
the dev servers run at the root instead, this preview is the only local check that
the built base paths are correct — worth running before you push anything.

## Deploying

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. **This requires Settings → Pages → Source to be set to "GitHub Actions"** — deploys fail until that is done, and it cannot be set from the workflow.

## Adding a version

1. Create `v3/` as its own Vite app, with `base: "/rosaura10/v3/"` in its `vite.config.js`.
2. Add `"v3"` to `workspaces` in the root `package.json`, plus a `dev:v3` script. The
   root `build` script uses `--workspaces`, so it picks the new app up on its own.
3. Add `"v3"` to `VERSIONS` in `scripts/assemble.mjs`.
4. Add an entry to the list in `public/index.html`.
