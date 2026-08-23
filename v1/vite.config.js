import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { devVersionRedirect } from "../scripts/dev-version-redirect.mjs";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/rosaura10/v1/" : "/",
  plugins: [react(), devVersionRedirect()],
  appType: "mpa",
  server: { port: 5173, strictPort: true },
}));
