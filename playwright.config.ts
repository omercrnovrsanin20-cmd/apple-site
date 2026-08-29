import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    },
  },
  reporter: [["list"]],
});
