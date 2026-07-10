import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { PrismaExceptionFilter } from '@/common/filters/prisma-exception.filter';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { PrismaService } from '@/prisma/prisma.service';

describe('Public API (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({})
            .compile();

        app = moduleFixture.createNestApplication();
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
        app.useGlobalFilters(
            new PrismaExceptionFilter(),
            new HttpExceptionFilter(),
        );

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('/api/v1 (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1')
            .expect(200)
            .expect(({ body }) => {
                expect(body).toEqual({
                    success: true,
                    data: {
                        name: 'RaktoSetu API',
                        status: 'ok',
                    },
                    message: '',
                    errors: [],
                });
            });
    });

    it('/api/v1/info/compatibility (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1/info/compatibility')
            .expect(200)
            .expect((response: { body: unknown }) => {
                const body = response.body as {
                    data: Record<string, string[]>;
                };

                expect(body.data['O-']).toContain('AB+');
            });
    });
});
