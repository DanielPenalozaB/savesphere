import { Module, type DynamicModule } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module.js';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ConfigModule } from './config/config.module.js';
import type { Env } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health/health.controller.js';
import { MeModule } from './me/me.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';

@Module({})
export class AppModule {
	static forRoot(env: Env): DynamicModule {
		return {
			module: AppModule,
			imports: [
				ConfigModule.forRoot(env),
				DatabaseModule,
				AuthModule,
				MeModule,
				AiModule,
				AccountsModule,
				CategoriesModule,
				TransactionsModule
			],
			controllers: [HealthController]
		};
	}
}
