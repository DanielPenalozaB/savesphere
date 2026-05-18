import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: path.resolve(dirname, '../../project.inlang'),
      outdir: './src/lib/paraglide'
    })
  ],
  server: {
    proxy: {
      '/auth': {
        target: process.env.API_PROXY_URL || 'http://localhost:3000',
        changeOrigin: true,
        bypass(req) {
          // Let SvelteKit handle GET requests to auth pages (e.g. /auth/sign-in)
          // But proxy API endpoints like /auth/me, /auth/verify-email
          if (req.method === 'GET') {
            const path = req.url || '';
            const pagePaths = ['/auth/sign-in', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/callback', '/auth/verify-email'];
            // Note: /auth/verify-email is actually an API endpoint, not a page
            // The verify-email page is at /auth/verify-email but the backend also handles GET /auth/verify-email
            // In production this wouldn't be an issue. For dev, we proxy API-style endpoints.
            const apiGetPaths = ['/auth/me'];
            if (apiGetPaths.some(p => path.startsWith(p))) {
              return undefined; // proxy to API
            }
            if (pagePaths.some(p => path.startsWith(p))) {
              return req.url; // let SvelteKit handle
            }
            return undefined; // proxy unknown auth paths to API
          }
        }
      },
      '/api': {
        target: process.env.API_PROXY_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  test: {
    expect: {
      requireAssertions: true
    },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
                headless: true
              }
            ]
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**']
        }
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium'
              }
            ]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }
    ]
  }
});
