import { ArgumentsHost, BadRequestException, Catch, ConflictException, ExceptionFilter, HttpException, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

type PrismaMeta = {
    target?: unknown;
    driverAdapterError?: {
        cause?: {
            constraint?: {
                fields?: string[];
            };
        };
    };
};

type ErrorBody = {
    message?: string | string[];
    errors?: unknown[];
};

const UNIQUE_MESSAGES: Record<string, string> = {
    phone: 'This phone number is already registered',
    email: 'This email is already registered',
};

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
        const httpException = this.toHttpException(exception);

        const { message, errors } = this.formatError(
            httpException.getResponse(),
            httpException.message,
        );

        response.status(httpException.getStatus()).json({
            success: false,
            data: null,
            message,
            errors,
        });
    }

    private toHttpException(
        exception:
            | Prisma.PrismaClientKnownRequestError
            | Prisma.PrismaClientInitializationError
            | Prisma.PrismaClientUnknownRequestError
            | Prisma.PrismaClientRustPanicError,
    ): HttpException {

        console.log(JSON.stringify(exception, null, 2));
        if (exception instanceof Prisma.PrismaClientInitializationError) {
            return new ServiceUnavailableException(
                // 'Database is temporarily unavailable',
                'Service temporarily unavailable. Please try again later.',

            );
        }

        if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
            return new ServiceUnavailableException(
                // 'Database request could not be completed',
                'Service temporarily unavailable. Please try again later.',

            );
        }

        if (exception instanceof Prisma.PrismaClientRustPanicError) {
            return new ServiceUnavailableException(
                // 'Database engine encountered an error',
                'Service temporarily unavailable. Please try again later.',

            );
        }
        switch (exception.code) {
            case 'P2002': return this.uniqueError(exception);

            case 'P2003': return new BadRequestException(
                'Invalid related record id provided',
            );
            case 'P2025': return new NotFoundException(
                'Requested record was not found',
            );
            default: return new InternalServerErrorException(
                'Something went wrong. Please try again later.',
            );
        }
    }

    private uniqueError(
        exception: Prisma.PrismaClientKnownRequestError,
    ): ConflictException {
        const fields = this.getUniqueFields(exception);
        console.log(JSON.stringify(exception, null, 2));
        return new ConflictException({
            message: 'Validation failed',
            errors: fields.map((field) => ({
                field,
                message: UNIQUE_MESSAGES[field] ?? `${field} already exists`,
            })),
        });
    }

    private getUniqueFields(
        exception: Prisma.PrismaClientKnownRequestError,
    ): string[] {
        const meta = exception.meta as PrismaMeta | undefined;

        if (Array.isArray(meta?.target)) {
            return meta.target.map(String);
        }

        if (typeof meta?.target === 'string') {
            return [meta.target];
        }

        return meta?.driverAdapterError?.cause?.constraint?.fields ?? [
            'unknown',
        ];
    }

    private formatError(
        exceptionResponse: string | object,
        fallbackMessage: string,
    ): {
        message: string;
        errors: unknown[];
    } {
        if (typeof exceptionResponse === 'string') {
            return {
                message: exceptionResponse,
                errors: [exceptionResponse],
            };
        }

        const body = exceptionResponse as ErrorBody;

        if (Array.isArray(body.errors)) {
            return {
                message:
                    typeof body.message === 'string'
                        ? body.message
                        : 'Validation failed',
                errors: body.errors,
            };
        }

        if (Array.isArray(body.message)) {
            return {
                message: 'Validation failed',
                errors: body.message,
            };
        }

        return {
            message: fallbackMessage,
            errors: [fallbackMessage],
        };
    }
}