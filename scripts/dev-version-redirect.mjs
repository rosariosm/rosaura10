// In dev each version is served from its own port root, but the deployed site
// uses /rosaura10/<version>/ paths. Bookmarks and habit produce the deployed
// shape locally, which would otherwise 404 on whichever server you happened to
// hit. Bounce those to the right port instead.
const PORTS = { v1: 5173, v2: 5174 };

export const devVersionRedirect = () => ({
  name: "dev-version-redirect",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const match = /^\/rosaura10\/(v\d+)(\/.*)?$/.exec(req.url ?? "");
      const port = match && PORTS[match[1]];
      if (!port) return next();
      res.writeHead(302, { location: `http://localhost:${port}/` });
      res.end();
    });
  },
});
