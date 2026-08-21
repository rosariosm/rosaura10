// Combines each version's build into one directory for GitHub Pages:
//   dist/        the hub page, from public/
//   dist/v1/     the original animation
//   dist/v2/     the new one
// Adding a version means building it and listing it in VERSIONS below.
import { cp, mkdir, rm } from "node:fs/promises";

const VERSIONS = ["v1", "v2"];

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL("public/", root), dist, { recursive: true });

for (const version of VERSIONS) {
  await cp(new URL(`${version}/dist/`, root), new URL(`${version}/`, dist), {
    recursive: true,
  });
}

console.log(`assembled dist/ with: ${VERSIONS.join(", ")}`);
