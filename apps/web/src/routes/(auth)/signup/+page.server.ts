import { fail, redirect } from '@sveltejs/kit';
import { callAuth, formString } from '#lib/server/auth.ts';
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
		redirect(303, '/');
	}
};
