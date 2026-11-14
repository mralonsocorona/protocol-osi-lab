import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const html = await readFile("dist/index.html", "utf8");
const workerPath = "dist/service-worker.js";
let worker = await readFile(workerPath, "utf8");
const bundledAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)]
  .map((match) => match[1]);
const offlineChunks = (await readdir("dist/assets"))
  .filter((name) => /\.(?:js|css)$/.test(name))
  .map((name) => `/assets/${name}`);
const urls = [
  "/",
  "/capas",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  ...new Set([...bundledAssets, ...offlineChunks]),
];
const versionHash = createHash("sha256");
versionHash.update(worker);
for (const url of [...urls].sort()) {
  const file = ["/", "/capas", "/index.html"].includes(url)
    ? "dist/index.html"
    : join("dist", url.slice(1));
  versionHash.update(url);
  versionHash.update(await readFile(file));
}
const version = versionHash.digest("hex").slice(0, 12);
worker = worker
  .replace('const CACHE_NAME = `${CACHE_PREFIX}dev`;', `const CACHE_NAME = \`${"${CACHE_PREFIX}"}${version}\`;`)
  .replace("const PRECACHE_URLS = [];", `const PRECACHE_URLS = ${JSON.stringify(urls)};`);
await writeFile(workerPath, worker);
console.log(`Generated service worker ${version} with ${urls.length} precached resources.`);
