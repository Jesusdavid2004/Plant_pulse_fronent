import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const FRONTEND_PORT = 5174;
const BACKEND_PORT = 3100;
const BACKEND_DIR = '../backend';
const frontendUrl = `http://localhost:${FRONTEND_PORT}`;
const backendUrl = `http://localhost:${BACKEND_PORT}`;
const hasBackend = existsSync(BACKEND_DIR);
const externalBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: externalBaseUrl ?? frontendUrl,
    locale: 'en-US',
    ...(process.env.CI ? {} : { channel: 'msedge' }),
    trace: 'retain-on-failure',
  },
  webServer: externalBaseUrl
    ? undefined
    : [
        {
          command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
          url: frontendUrl,
          reuseExistingServer: true,
          env: { VITE_API_URL: `${backendUrl}/api` },
        },
        ...(hasBackend
          ? [
              {
                command: 'npm start',
                cwd: BACKEND_DIR,
                url: `${backendUrl}/health`,
                reuseExistingServer: true,
                env: {
                  PORT: String(BACKEND_PORT),
                  AI_PROVIDER: 'fake',
                  AI_FALLBACK_PROVIDER: 'none',
                  CORS_ORIGIN: frontendUrl,
                  LOG_LEVEL: 'warn',
                },
              },
            ]
          : []),
      ],
});
