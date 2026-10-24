import { fail, redirect } from '@sveltejs/kit';
import { callAuth, formString } from '#lib/server/auth.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = formString(data, 'email');
		const error = await callAuth(event, '/sign-in/email', {
			email,
			password: formString(data, 'password')
		});
		if (error) return fail(400, { error, email });
		redirect(303, '/');
	}
};
