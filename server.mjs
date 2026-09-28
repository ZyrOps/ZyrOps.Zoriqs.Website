import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
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

const immutableTypes = new Set([
  ".css",
  ".js",
  ".svg",
  ".gif",
  ".png",
  ".ico",
  ".avif",
  ".webp",
  ".mp4",
  ".webm",
  ".woff2",
  ".otf"
]);

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  let file = normalize(join(root, pathname));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (pathname.includes("/.") || pathname.endsWith("package.json")) {
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

  const ext = extname(file);
  const headers = {
    "Content-Type": types[ext] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  };

  if (immutableTypes.has(ext)) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else if (ext === ".html") {
    headers["Cache-Control"] = "public, max-age=3600, must-revalidate";
  } else {
    headers["Cache-Control"] = "public, max-age=3600";
  }

  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`Zoriqs website running at http://127.0.0.1:${port}`);
});
