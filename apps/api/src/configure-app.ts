import type { INestApplication } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import express, { type Express } from 'express';
import { AUTH, type Auth } from './auth/auth.factory.js';
import { EnvelopeInterceptor } from './common/envelope.interceptor.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';

/** Shared by main.ts and the integration tests so both run the exact same HTTP pipeline. */
export function configureApp(app: INestApplication): INestApplication {
	const http = app.getHttpAdapter().getInstance() as Express;
	// Better Auth must see the raw body, so it is mounted before the JSON parser.
	http.all('/api/auth/{*path}', toNodeHandler(app.get<Auth>(AUTH)));
	app.use(express.json({ limit: '1mb' }));

	app.setGlobalPrefix('api');
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalInterceptors(new EnvelopeInterceptor());
	app.enableShutdownHooks();
	return app;
}
