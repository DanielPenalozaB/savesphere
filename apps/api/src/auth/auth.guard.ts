import {
	Inject,
	Injectable,
	UnauthorizedException,
	type CanActivate,
	type ExecutionContext
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { AUTH, type Auth } from './auth.factory.js';
import { IS_PUBLIC, type AuthenticatedRequest } from './auth.decorators.js';

/** Global guard: every route requires a Better Auth session unless marked @Public(). */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		@Inject(AUTH) private readonly auth: Auth
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
			context.getHandler(),
			context.getClass()
		]);
		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const session = await this.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
		if (!session) {
			throw new UnauthorizedException('Authentication required');
		}
		request.user = { id: session.user.id, email: session.user.email, name: session.user.name };
		return true;
	}
}
