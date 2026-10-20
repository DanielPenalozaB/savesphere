// Shared ESLint config for the TypeScript packages and the API (the web app has its own Svelte config).
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
	globalIgnores([
		'**/node_modules/',
		'**/dist/',
		'**/build/',
		'**/coverage/',
		'**/.svelte-kit/',
		'**/test-results/',
		'**/playwright-report/',
		'apps/web/'
	]),
	js.configs.recommended,
	ts.configs.recommended,
	{
		languageOptions: { globals: { ...globals.node } },
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
			// NestJS injects constructor parameters by their runtime type; keep those as value imports.
			'@typescript-eslint/no-extraneous-class': 'off'
		}
	},
	{
		// Playwright fixtures must destructure their (empty) dependencies.
		files: ['e2e/**/*.ts'],
		rules: { 'no-empty-pattern': 'off' }
	},
	{
		files: ['apps/api/src/**/*.ts'],
		rules: { '@typescript-eslint/consistent-type-imports': 'off' }
	}
);
