import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC compiles NestJS decorators + emitDecoratorMetadata, which esbuild does not support.
export default defineConfig({
	plugins: [swc.vite({ module: { type: 'es6' } })],
	test: {
		globals: true,
		coverage: {
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.spec.ts', 'src/main.ts'],
			// The real-provider adapter is exercised manually / by provider contract tests, not in CI.
			thresholds: { lines: 85, statements: 85, functions: 85, branches: 70 }
		},
		projects: [
			{
				extends: true,
				test: { name: 'unit', include: ['src/**/*.spec.ts'] }
			},
			{
				extends: true,
				test: {
					name: 'integration',
					include: ['test/**/*.int-spec.ts'],
					globalSetup: ['test/global-setup.ts'],
					testTimeout: 30_000,
					hookTimeout: 60_000
				}
			}
		]
	}
});
