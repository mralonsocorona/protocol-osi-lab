import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test("development servers do not bind every interface by default", () => {
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };

  expect(manifest.scripts.dev).not.toMatch(/--host\s+0\.0\.0\.0/);
  expect(manifest.scripts.preview).not.toMatch(/--host\s+0\.0\.0\.0/);
});
