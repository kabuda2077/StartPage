const { defineConfig } = require('@playwright/test');
const fs = require('node:fs');
const localChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
module.exports = defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 20000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
    launchOptions: fs.existsSync(localChrome) ? { executablePath: localChrome } : {},
    trace: 'retain-on-failure'
  },
  webServer: { command: 'node tools/test-server.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  reporter: 'list'
});
