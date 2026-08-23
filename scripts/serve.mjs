import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PREFIX = "/rosaura10";
const PORT = Number(process.env.PORT ?? 4173);
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const send = (res, code, body) => {
  res.writeHead(code, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  if (!pathname.startsWith(PREFIX)) {
    res.writeHead(302, { location: `${PREFIX}/` });
    return res.end();
  }

  const rel = normalize(pathname.slice(PREFIX.length)).replace(/^(\.\.[/\\])+/, "");
  let file = join(DIST, rel);

  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
  } catch {
    return send(res, 404, `404 ${pathname}`);
  }

  try {
    await stat(file);
  } catch {
    return send(res, 404, `404 ${pathname}`);
  }

  res.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`  preview  http://localhost:${PORT}${PREFIX}/`);
});
