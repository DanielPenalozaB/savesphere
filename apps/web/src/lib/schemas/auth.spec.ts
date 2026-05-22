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

  it('rejects invalid email format', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user@@example.com',
      'user@example',
      'user example.com'
    ];
    for (const email of invalidEmails) {
      const result = loginSchema.safeParse({ email, password: 'secret123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'email')).toBe(true);
      }
    }
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: ''
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'secret123'
    });
    expect(result.success).toBe(false);
  });

  it('rejects completely empty object', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty full name', () => {
    const result = registerSchema.safeParse({
      fullName: '',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'fullName')).toBe(true);
    }
  });

  it('rejects full name containing digits', () => {
    const namesWithDigits = ['John123', 'J0hn', '123', 'Name2Test', 'Test99Name'];
    for (const fullName of namesWithDigits) {
      const result = registerSchema.safeParse({
        fullName,
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'fullName')).toBe(true);
      }
    }
  });

  it('accepts Unicode names without digits', () => {
    const unicodeNames = ['José García', '中村', 'Александр', 'François', 'Namık'];
    for (const fullName of unicodeNames) {
      const result = registerSchema.safeParse({
        fullName,
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts emoji in full name', () => {
    const result = registerSchema.safeParse({
      fullName: 'John 🎉',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'short',
      confirmPassword: 'short'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(true);
    }
  });

  it('rejects password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(true);
    }
  });

  it('rejects password without digit', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'PasswordOnly',
      confirmPassword: 'PasswordOnly'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(true);
    }
  });

  it('rejects password without uppercase and digit', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password',
      confirmPassword: 'password'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'password')).toBe(true);
    }
  });

  it('accepts edge-case valid passwords', () => {
    const validPasswords = ['A1######', 'Z9aaaaaaaa', 'X0!@#$%^'];
    for (const password of validPasswords) {
      const result = registerSchema.safeParse({
        fullName: 'John Doe',
        email: 'john@example.com',
        password,
        confirmPassword: password
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects mismatched confirm password', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password124'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'confirmPassword')).toBe(true);
    }
  });

  it('rejects empty confirm password', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'confirmPassword')).toBe(true);
    }
  });

  it('accepts XSS-like payload in full name when no digits present', () => {
    const result = registerSchema.safeParse({
      fullName: '<script>alert()</script>',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    // Zod only checks for digits, so this technically passes schema validation
    // (actual XSS protection happens at rendering time, not schema level)
    expect(result.success).toBe(true);
  });

  it('rejects SQL injection in email', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: "' OR 1=1 --",
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'email')).toBe(true);
    }
  });

  it('reports multiple validation errors at once', () => {
    const result = registerSchema.safeParse({
      fullName: '',
      email: 'bad-email',
      password: 'short',
      confirmPassword: 'different'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain('fullName');
      expect(fields).toContain('email');
      expect(fields).toContain('password');
      expect(fields).toContain('confirmPassword');
    }
  });
});
