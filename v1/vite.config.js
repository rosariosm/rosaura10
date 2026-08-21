import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://rosariosm.github.io/rosaura10/v1/ once deployed, and the
// assemble step copies this build into dist/v1, so the base has to match.
export default defineConfig({
  base: "/rosaura10/v1/",
  plugins: [react()],
});
