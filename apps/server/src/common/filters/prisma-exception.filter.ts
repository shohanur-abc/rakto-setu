import {
    ArgumentsHost,
    Catch,
    ConflictException,
    ExceptionFilter,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(
    Prisma.PrismaClientKnownRequestError,
    Prisma.PrismaClientInitializationError,
    Prisma.PrismaClientUnknownRequestError,
    Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(
        exception:
            | Prisma.PrismaClientKnownRequestError
            | Prisma.PrismaClientInitializationError
            | Prisma.PrismaClientUnknownRequestError
            | Prisma.PrismaClientRustPanicError,
        host: ArgumentsHost,
    ) {
        const response = host.switchToHttp().getResponse<Response>();
        const httpException = this.mapException(exception);
        const status = httpException.getStatus();

        response.status(status).json({
            success: false,
            data: null,
            message: httpException.message,
            errors: [httpException.message],
        });
    }


    // ---------------- Map Exception ----------------

    private mapException(
        exception:
            | Prisma.PrismaClientKnownRequestError
            | Prisma.PrismaClientInitializationError
            | Prisma.PrismaClientUnknownRequestError
            | Prisma.PrismaClientRustPanicError,
    ) {
        if (exception instanceof Prisma.PrismaClientInitializationError) {
            return new ServiceUnavailableException(
                'Database is temporarily unavailable',
            );
        }

        if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
            // Check for timeout / connection codes in message
            const msg = exception.message ?? '';
            if (
                msg.includes('ETIMEDOUT') ||
                msg.includes('ECONNREFUSED') ||
                msg.includes('ECONNRESET')
            ) {
                return new ServiceUnavailableException(
                    'Database connection timed out',
                );
            }
            return new ServiceUnavailableException(
                'Database request could not be completed',
            );
        }

        if (exception instanceof Prisma.PrismaClientRustPanicError) {
            return new ServiceUnavailableException(
                'Database engine encountered an error',
            );
        }

        // PrismaClientKnownRequestError
        const known = exception as Prisma.PrismaClientKnownRequestError;
        const code = known.code ?? '';

        // Connection / timeout errors surfaced as known error codes
        if (['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET'].includes(code)) {
            return new ServiceUnavailableException(
                'Database connection timed out',
            );
        }

        if (known.code === 'P2002') {
            return new ConflictException(
                'A record with these details already exists',
            );
        }

        if (known.code === 'P2025') {
            return new NotFoundException('Requested record was not found');
        }

        return new ConflictException('Database request could not be completed');
    }
}
