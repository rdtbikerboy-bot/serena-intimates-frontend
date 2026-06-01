import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Habilitar gestos táctiles reales
    hasTouch: true,
    isMobile: true,
  },

  /* Configure projects for major mobile browsers/devices */
  projects: [
    {
      name: 'Mobile Safari (iPhone 13)',
      use: { 
        ...devices['iPhone 13'],
        hasTouch: true,
      },
    },
    {
      name: 'Mobile Chrome (Pixel 5)',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'Mobile Chrome (Samsung Galaxy S20)',
      use: { 
        ...devices['Galaxy S9+'], // Usando S9+ como proxy para gama media/alta Samsung
        hasTouch: true,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
