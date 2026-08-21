import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { devVersionRedirect } from "../scripts/dev-version-redirect.mjs";

// The base only applies to builds, where it has to match the GitHub Pages URL
// (https://rosariosm.github.io/rosaura10/v2/). In dev the app is served from
// the root instead, so local URLs stay short and there is no way to end up on
// another version's path by accident. Use `npm run serve` to preview a build
// with the real prefix.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/rosaura10/v2/" : "/",
  plugins: [react(), devVersionRedirect()],
  // No client-side routing here, so skip the SPA fallback: an unknown path
  // should 404 rather than quietly serving this version's page.
  appType: "mpa",
  // Each version owns a port so they can run side by side, and strictPort
  // makes a clash fail loudly instead of silently landing on another app.
  server: { port: 5174, strictPort: true },
}));
