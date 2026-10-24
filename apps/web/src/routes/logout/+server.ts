import { redirect } from '@sveltejs/kit';
import { callAuth } from '#lib/server/auth.ts';
import type { RequestHandler } from './$types';

/** Sign out via a plain form POST, so it works before hydration too. */
export const POST: RequestHandler = async (event) => {
	await callAuth(event, '/sign-out');
	redirect(303, '/login');
};
