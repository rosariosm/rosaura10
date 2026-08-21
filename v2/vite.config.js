import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://rosariosm.github.io/rosaura10/v2/ once deployed, and the
// assemble step copies this build into dist/v2, so the base has to match.
export default defineConfig({
  base: "/rosaura10/v2/",
  plugins: [react()],
});
