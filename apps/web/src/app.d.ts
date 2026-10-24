/// <reference types="unplugin-icons/types/svelte5" />
import type { SessionUser } from '#lib/auth/user.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** The signed-in user, resolved from the session cookie in `hooks.server.ts`. */
			user: SessionUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
