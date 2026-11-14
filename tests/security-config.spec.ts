import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test("development servers do not bind every interface by default", () => {
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };

  expect(manifest.scripts.dev).not.toMatch(/--host\s+0\.0\.0\.0/);
  expect(manifest.scripts.preview).not.toMatch(/--host\s+0\.0\.0\.0/);
});

test("production server preserves security headers and narrowly scopes the PWA", () => {
  const nginx = readFileSync("nginx.conf", "utf8");
  const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8")) as {
    start_url: string;
    scope: string;
    display: string;
  };

  for (const header of ["X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options", "Permissions-Policy"])
    expect(nginx).toContain(`add_header ${header}`);
  expect(nginx).toContain("Service-Worker-Allowed \"/capas\"");
  expect(nginx).toContain("worker-src 'self'");
  expect(nginx).toContain("manifest-src 'self'");
  expect(nginx).toContain("location = /health");
  expect(nginx).toContain("location = /capas");
  expect(nginx).toContain("location /capas/assets/");
  expect(nginx).toContain("default_type application/manifest+json");
  expect(nginx).toContain("try_files $uri $uri/ /index.html");
  expect(nginx).not.toMatch(/script-src[^;]*unsafe-inline/);
  expect(manifest).toMatchObject({ start_url: "/capas", scope: "/capas", display: "standalone" });
});
