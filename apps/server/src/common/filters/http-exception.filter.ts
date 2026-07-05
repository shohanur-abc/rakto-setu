import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const errors = this.extractErrors(exceptionResponse);

        response.status(status).json({
            success: false,
            data: null,
            message: errors.at(0) ?? exception.message,
            errors,
        });
    }


    // ---------------- Extract Errors ----------------

    private extractErrors(exceptionResponse: string | object) {
        if (typeof exceptionResponse === 'string') {
            return [exceptionResponse];
        }

        if (
            Object.hasOwn(exceptionResponse, 'message') &&
            Array.isArray((exceptionResponse as { message: unknown }).message)
        ) {
            return (exceptionResponse as { message: string[] }).message;
        }

        if (
            Object.hasOwn(exceptionResponse, 'message') &&
            typeof (exceptionResponse as { message: unknown }).message === 'string'
        ) {
            return [(exceptionResponse as { message: string }).message];
        }

        return ['Request failed'];
    }
}
