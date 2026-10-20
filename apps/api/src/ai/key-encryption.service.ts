import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ENV, type Env } from '../config/env.js';

export interface EncryptedSecret {
	ciphertext: Buffer;
	iv: Buffer;
	authTag: Buffer;
	keyVersion: number;
}

const CURRENT_KEY_VERSION = 1;

/** AES-256-GCM envelope for user-provided API keys. Add new versions here to rotate keys. */
@Injectable()
export class KeyEncryptionService {
	private readonly keys: ReadonlyMap<number, Buffer>;

	constructor(@Inject(ENV) env: Env) {
		this.keys = new Map([[CURRENT_KEY_VERSION, Buffer.from(env.AI_KEYS_ENCRYPTION_KEY, 'base64')]]);
	}

	encrypt(plaintext: string): EncryptedSecret {
		const iv = randomBytes(12);
		const cipher = createCipheriv('aes-256-gcm', this.key(CURRENT_KEY_VERSION), iv);
		const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
		return { ciphertext, iv, authTag: cipher.getAuthTag(), keyVersion: CURRENT_KEY_VERSION };
	}

	decrypt(secret: EncryptedSecret): string {
		const decipher = createDecipheriv('aes-256-gcm', this.key(secret.keyVersion), secret.iv);
		decipher.setAuthTag(secret.authTag);
		return Buffer.concat([decipher.update(secret.ciphertext), decipher.final()]).toString('utf8');
	}

	private key(version: number): Buffer {
		const key = this.keys.get(version);
		if (!key) throw new Error(`Unknown encryption key version ${version}`);
		return key;
	}
}
