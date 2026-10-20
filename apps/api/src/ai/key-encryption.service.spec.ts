import { randomBytes } from 'node:crypto';
import type { Env } from '../config/env.js';
import { KeyEncryptionService } from './key-encryption.service.js';

const service = () =>
	new KeyEncryptionService({ AI_KEYS_ENCRYPTION_KEY: randomBytes(32).toString('base64') } as Env);

describe('KeyEncryptionService', () => {
	it('round-trips a secret with a random IV each time', () => {
		const encryption = service();
		const a = encryption.encrypt('sk-secret');
		const b = encryption.encrypt('sk-secret');
		expect(a.iv.equals(b.iv)).toBe(false);
		expect(a.ciphertext.toString('utf8')).not.toContain('sk-secret');
		expect(encryption.decrypt(a)).toBe('sk-secret');
	});

	it('detects tampering through the GCM auth tag', () => {
		const encryption = service();
		const secret = encryption.encrypt('sk-secret');
		secret.ciphertext[0] = secret.ciphertext[0]! ^ 0xff;
		expect(() => encryption.decrypt(secret)).toThrow();
	});

	it('cannot decrypt with a different master key', () => {
		const secret = service().encrypt('sk-secret');
		expect(() => service().decrypt(secret)).toThrow();
	});

	it('refuses unknown key versions', () => {
		const encryption = service();
		expect(() => encryption.decrypt({ ...encryption.encrypt('x'), keyVersion: 99 })).toThrow(
			/version 99/
		);
	});
});
