import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
	API_INTERNAL_URL: {
		description: 'Where the web server forwards /api/* (the API service on the private network).',
		schema: z.url().default('http://localhost:3000')
	}
});
