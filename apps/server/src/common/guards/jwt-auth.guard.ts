import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenPurpose, Role } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '../types/auth-user';
import { hashLookupToken } from '../utils/crypto';

type JwtPayload = {
    sub: string;
    phone: string;
    role: Role;
    jti: string;
};

type RequestWithUser = Request & {
    user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }


    // ---------------- Can Activate ----------------

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const token = this.extractBearerToken(request);

        if (!token) {
            throw new UnauthorizedException('Bearer token is required');
        }

        const payload = await this.verifyToken(token);
        await this.assertSessionIsActive(payload);

        request.user = {
            id: payload.sub,
            phone: payload.phone,
            role: payload.role,
            jti: payload.jti,
        };

        return true;
    }


    // ---------------- Extract Token ----------------

    private extractBearerToken(request: Request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return type === 'Bearer' ? token : null;
    }


    // ---------------- Verify Token ----------------

    private async verifyToken(token: string) {
        try {
            return await this.jwtService.verifyAsync<JwtPayload>(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }


    // ---------------- Assert Session ----------------

    private async assertSessionIsActive(payload: JwtPayload) {
        const session = await this.prisma.authToken.findFirst({
            where: {
                userId: payload.sub,
                tokenHash: hashLookupToken(payload.jti),
                purpose: AuthTokenPurpose.SESSION,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });

        if (!session) {
            throw new UnauthorizedException('Session is no longer active');
        }
    }
}
