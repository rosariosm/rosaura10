import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { devVersionRedirect } from "../scripts/dev-version-redirect.mjs";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/rosaura10/v2/" : "/",
  plugins: [react(), devVersionRedirect()],
  appType: "mpa",
  server: { port: 5174, strictPort: true },
}));
