import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';
import { loadEnv } from './config/env.js';

// Local development reads the repo-root .env (real environment variables always win).
for (const file of ['.env', '../../.env']) {
	if (existsSync(file)) process.loadEnvFile(file);
}

const env = loadEnv();
const app = configureApp(await NestFactory.create(AppModule.forRoot(env), { bodyParser: false }));
await app.listen(env.PORT);
Logger.log(`API listening on :${env.PORT}`, 'Bootstrap');
