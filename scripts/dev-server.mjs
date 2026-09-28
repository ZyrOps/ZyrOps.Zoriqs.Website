import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Local preview only. Production is served as static files by Vercel (see vercel.json);
// keep this out of the project root so Vercel does not detect it as a Node server entrypoint.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".otf": "font/otf",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  let file = normalize(join(root, pathname));
  if (!file.startsWith(root) || pathname.includes("/.")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  }

  if (!existsSync(file)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[extname(file)] || "application/octet-stream",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`Zoriqs website running at http://127.0.0.1:${port}`);
});
