import { fail, redirect } from '@sveltejs/kit';
import { callAuth, formString } from '#lib/server/auth.ts';
import { regionalSettings } from '#lib/server/regional.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const name = formString(data, 'name').trim();
		const email = formString(data, 'email');
		// Better Auth signs the new user in right away (session cookie on the response).
		const error = await callAuth(event, '/sign-up/email', {
			name,
			email,
			password: formString(data, 'password')
		});
		if (error) return fail(400, { error, name, email });

		// Months and money follow the browser's time zone and region (e.g. America/Bogota, es-CO).
		const regional = regionalSettings(data);
		if (Object.keys(regional).length > 0) {
			await event
				.fetch('/api/me/settings', {
					method: 'PATCH',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(regional)
				})
				.catch(() => undefined); // Defaults (UTC, en-US) still work.
		}
		redirect(303, '/');
	}
};
