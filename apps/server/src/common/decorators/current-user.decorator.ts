import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../types/auth-user';

export type AuthenticatedRequest = Request & {
    user: AuthUser;
};

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): AuthUser => {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        return request.user;
    },
);
