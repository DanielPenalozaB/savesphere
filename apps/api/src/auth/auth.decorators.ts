import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const IS_PUBLIC = 'isPublic';
/** Marks a route as reachable without a session. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

export interface AuthUser {
	id: string;
	email: string;
	name: string;
}

export type AuthenticatedRequest = Request & { user: AuthUser };

export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthUser =>
		context.switchToHttp().getRequest<AuthenticatedRequest>().user
);
