import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1)
});

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const noDigitsRegex = /^[^\d]*$/;

export const registerSchema = z
	.object({
		fullName: z
			.string()
			.min(1)
			.regex(noDigitsRegex, { message: 'Full name cannot contain numbers' }),
		email: z.string().email(),
		password: z.string().regex(passwordRegex, {
			message:
				'Password must be at least 8 characters with 1 uppercase letter and 1 number'
		}),
		confirmPassword: z.string().min(1)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;
