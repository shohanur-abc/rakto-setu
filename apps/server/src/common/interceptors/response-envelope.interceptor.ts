import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { SKIP_ENVELOPE_KEY } from '../decorators/skip-envelope.decorator';

export type ResponseEnvelope<T> = {
    success: true;
    data: T;
    message: string;
    errors: [];
};

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
    T,
    T | ResponseEnvelope<T>
> {
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<T | ResponseEnvelope<T>> {
        const skipEnvelope = this.reflector.getAllAndOverride<boolean>(
            SKIP_ENVELOPE_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (skipEnvelope) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                message: '',
                errors: [],
            })),
        );
    }
}
