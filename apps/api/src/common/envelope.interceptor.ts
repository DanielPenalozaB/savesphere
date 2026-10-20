import {
	Injectable,
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor
} from '@nestjs/common';
import type { ApiSuccess } from '@savesphere/contracts';
import { map, type Observable } from 'rxjs';

/** Wraps every successful response as `{ success: true, data }`. */
@Injectable()
export class EnvelopeInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
	intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T>> {
		return next.handle().pipe(map((data) => ({ success: true as const, data: data ?? null! })));
	}
}
