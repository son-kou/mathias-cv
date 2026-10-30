import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end-test af den færdigbyggede side (kør `npm run build` først).
 * Bruger den installerede Google Chrome, så der ikke skal hentes ekstra browsere.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/mathias-cv/',
    channel: 'chrome',
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/mathias-cv/',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } } },
    { name: 'mobil', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
})
