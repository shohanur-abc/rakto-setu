import 'reflect-metadata';

process.env.JWT_SECRET ??= 'test-secret';
process.env.JWT_EXPIRES_IN ??= '7d';
