import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://rosariosm.github.io/rosaura10/v2/ once deployed, and the
// assemble step copies this build into dist/v2, so the base has to match.
export default defineConfig({
  base: "/rosaura10/v2/",
  plugins: [react()],
  // Each version owns a port so they can run side by side, and strictPort
  // makes a clash fail loudly instead of silently landing on another app.
  server: { port: 5174, strictPort: true },
});
