import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';
import { swaggerOperationIdFactory } from '../src/common/swagger/operation-id.factory';

const serverDirectory = resolve(__dirname, '..', '..');
const outputPath = resolve(serverDirectory, 'openapi.json');

process.loadEnvFile?.(resolve(serverDirectory, '.env'));

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(reflector));
  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RaktoSetu API')
    .setDescription('Community blood bank coordination API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: swaggerOperationIdFactory,
  });

  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();

  new Logger('OpenAPI').log(`Generated ${outputPath}`);
}

void generateOpenApi();
