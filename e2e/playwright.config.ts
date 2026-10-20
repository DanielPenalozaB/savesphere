import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL,
		extraHTTPHeaders: { Origin: baseURL },
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'smoke', testMatch: /smoke\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
		// The same journeys run with and without AI, so both modes stay supported.
		{
			name: 'ai-off',
			testMatch: /ai\.spec\.ts/,
			use: { ...devices['Pixel 7'] },
			metadata: { ai: false }
		},
		{
			name: 'ai-on',
			testMatch: /ai\.spec\.ts/,
			use: { ...devices['Pixel 7'] },
			metadata: { ai: true }
		}
	]
});
