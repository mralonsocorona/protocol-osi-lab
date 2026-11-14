import { defineConfig } from "@playwright/test";
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: externalBaseURL ?? "http://127.0.0.1:4173",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  webServer: externalBaseURL ? undefined : {
      command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
    },
  reporter: "list",
});
