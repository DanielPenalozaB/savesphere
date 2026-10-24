import { m } from '#lib/paraglide/messages.js';
import type { AuthErrorCode } from '#lib/server/auth.ts';

export const authErrorMessages: Record<AuthErrorCode, () => string> = {
	invalid_credentials: m.auth_error_invalid_credentials,
	email_taken: m.auth_error_email_taken,
	weak_password: m.auth_error_weak_password,
	unknown: m.auth_error_unknown
};
