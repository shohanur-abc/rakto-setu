import { Logger, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
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
    app.use(cookieParser());
    const corsOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    app.enableCors({
        // Reflect the request origin when no allowlist is configured (dev),
        // which is required for credentialed (cookie) cross-origin requests.
        origin: corsOrigins.length > 0 ? corsOrigins : true,
        credentials: true,
    });
    app.enableShutdownHooks();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
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
