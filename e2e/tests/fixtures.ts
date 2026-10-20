import { randomUUID } from 'node:crypto';
import { test as base, type APIRequestContext } from '@playwright/test';

interface Fixtures {
	/** A fresh user, signed in on both `page` and `request`. AI is connected on the ai-on project. */
	user: { email: string; api: APIRequestContext };
	aiEnabled: boolean;
}

export const test = base.extend<Fixtures>({
	aiEnabled: async ({}, use, testInfo) => {
		await use(Boolean(testInfo.project.metadata.ai));
	},
	user: async ({ page, aiEnabled }, use) => {
		const email = `e2e-${randomUUID()}@test.savesphere.app`;
		const api = page.request;
		const signUp = await api.post('/api/auth/sign-up/email', {
			data: { email, password: 'correct-horse-battery', name: 'E2E User' }
		});
		if (!signUp.ok()) throw new Error(`Sign-up failed: ${signUp.status()} ${await signUp.text()}`);
		if (aiEnabled) {
			const key = await api.put('/api/ai/credentials', {
				data: { provider: 'anthropic', apiKey: 'sk-e2e-0000000000' }
			});
			if (!key.ok()) throw new Error(`Connecting AI failed: ${key.status()}`);
		}
		await use({ email, api });
	}
});

export { expect } from '@playwright/test';
