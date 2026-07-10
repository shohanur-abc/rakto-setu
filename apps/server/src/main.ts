import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { swaggerOperationIdFactory } from './common/swagger/operation-id.factory';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const reflector = app.get(Reflector);
    const logger = new Logger('Bootstrap');

    app.setGlobalPrefix('api/v1');
    app.enableCors();
    app.enableShutdownHooks();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                const errors = validationErrors.flatMap((error) => {
                    const constraints = error.constraints ?? {};

                    return Object.values(constraints).map((message) => ({
                        field: error.property,
                        message,
                    }));
                });

                return new BadRequestException({
                    message: 'Validation failed',
                    errors,
                });
            },
        }),
    );
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(reflector));
    app.useGlobalFilters(
        new PrismaExceptionFilter(),
        new HttpExceptionFilter(),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('RaktoSetu API')
        .setDescription('Community blood bank coordination API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        operationIdFactory: swaggerOperationIdFactory,
    });
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 5000);
    logger.log(`Server listening on port ${process.env.PORT ?? 5000}`);
}
void bootstrap();
