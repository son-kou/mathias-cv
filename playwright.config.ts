import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end-test af den færdigbyggede side (kør `npm run build` først).
 * Bruger den installerede Google Chrome, så der ikke skal hentes ekstra browsere.
 *
 * Test den udgivne side i stedet:  E2E_URL=https://son-kou.github.io/mathias-cv/ npm run test:e2e
 */
const remote = process.env.E2E_URL

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: remote ?? 'http://localhost:4173/mathias-cv/',
    channel: 'chrome',
  },
  webServer: remote
    ? undefined
    : {
        command: 'npx vite preview --port 4173 --strictPort',
        url: 'http://localhost:4173/mathias-cv/',
        reuseExistingServer: true,
      },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } } },
    { name: 'mobil', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
})
