// Virtual screen-reader and axe tests. Run: npm test
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 60000,
  use: { baseURL: 'http://localhost:8080', viewport: { width: 1280, height: 800 } },
  webServer: { command: 'python3 -m http.server 8080', url: 'http://localhost:8080', reuseExistingServer: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
  ],
});
