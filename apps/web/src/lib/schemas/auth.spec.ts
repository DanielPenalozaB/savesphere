import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth.js';

describe('loginSchema', () => {
	it('accepts valid email and password', () => {
		const result = loginSchema.safeParse({
			email: 'user@example.com',
			password: 'secret123'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid email', () => {
		const result = loginSchema.safeParse({
			email: 'not-an-email',
			password: 'secret123'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty password', () => {
		const result = loginSchema.safeParse({
			email: 'user@example.com',
			password: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('registerSchema', () => {
	it('accepts valid registration data', () => {
		const result = registerSchema.safeParse({
			fullName: 'John Doe',
			email: 'john@example.com',
			password: 'password123'
		});
		expect(result.success).toBe(true);
	});

	it('rejects short password', () => {
		const result = registerSchema.safeParse({
			fullName: 'John Doe',
			email: 'john@example.com',
			password: 'short'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty full name', () => {
		const result = registerSchema.safeParse({
			fullName: '',
			email: 'john@example.com',
			password: 'password123'
		});
		expect(result.success).toBe(false);
	});
});
