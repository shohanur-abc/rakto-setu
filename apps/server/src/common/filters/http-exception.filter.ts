import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

type FieldError = {
    field: string;
    message: string;
};

type ErrorResponseBody = {
    message?: string | string[];
    errors?: string[] | FieldError[];
    statusCode?: number;
    error?: string;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const { message, errors } = this.formatExceptionResponse(
            exceptionResponse,
            exception.message,
        );

        response.status(status).json({
            success: false,
            data: null,
            message,
            errors,
        });
    }

    private formatExceptionResponse(
        exceptionResponse: string | object,
        fallbackMessage: string,
    ): {
        message: string;
        errors: string[] | FieldError[];
    } {
        if (typeof exceptionResponse === 'string') {
            return {
                message: exceptionResponse,
                errors: [exceptionResponse],
            };
        }

        const body = exceptionResponse as ErrorResponseBody;

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

        if (typeof body.message === 'string') {
            return {
                message: body.message,
                errors: [body.message],
            };
        }

        return {
            message: fallbackMessage || 'Request failed',
            errors: [fallbackMessage || 'Request failed'],
        };
    }
}