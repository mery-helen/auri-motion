import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from './auth.module.js';

type PrismaMock = {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

function createPrismaMock(): PrismaMock {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
}

function createConfigServiceMock() {
  const values: Record<string, string> = {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '3600',
  };

  return {
    get: vi.fn((key: string) => values[key]),
    getOrThrow: vi.fn((key: string) => values[key]),
  };
}

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaMock;
  let jwtService: JwtService;

  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const validPayload = {
    name: 'Ana Fisioterapeuta',
    email: 'ana@example.com',
    password: 'Senha@123',
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
          }),
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(ConfigService)
      .useValue(createConfigServiceMock())
      .compile();

    jwtService = moduleRef.get(JwtService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register creates the account and hides passwordHash', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'user-1',
        ...data,
        createdAt,
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validPayload)
      .expect(201);

    expect(response.body.data).toEqual({
      id: 'user-1',
      name: validPayload.name,
      email: validPayload.email,
      createdAt: createdAt.toISOString(),
    });
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('POST /auth/register returns a conflict for an e-mail already in use', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-existing',
      name: 'Existing User',
      email: validPayload.email,
      passwordHash: 'existing-hash',
      createdAt,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validPayload)
      .expect(409);

    expect(response.body.erro).toBe('E-mail já está em uso.');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('POST /auth/register rejects missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: '', password: '' })
      .expect(400);

    expect(response.body.erro).toEqual(
      expect.arrayContaining([
        'Nome é obrigatório.',
        'E-mail é obrigatório.',
        'Senha é obrigatória.',
      ]),
    );
  });

  it('POST /auth/register rejects an invalid e-mail format', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, email: 'not-an-email' })
      .expect(400);

    expect(response.body.erro).toContain('E-mail inválido.');
  });

  it('POST /auth/register rejects a weak password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, password: 'weakpass' })
      .expect(400);

    expect(response.body.erro).toContain(
      'A senha deve ter no mínimo 8 caracteres, com ao menos 1 letra maiúscula, 1 número e 1 caractere especial.',
    );
  });

  it('POST /auth/login returns an access token with a one-hour expiry', async () => {
    const passwordHash = await bcrypt.hash(validPayload.password, 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: validPayload.name,
      email: validPayload.email,
      passwordHash,
      createdAt,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validPayload.email, password: validPayload.password })
      .expect(200);

    expect(response.body.data).toEqual({
      accessToken: expect.any(String),
      expiresIn: 3600,
    });

    const payload = await jwtService.verifyAsync(response.body.data.accessToken as string);
    expect(payload).toMatchObject({ sub: 'user-1' });
  });

  it('POST /auth/login issues a token whose lifetime is one hour', async () => {
    const passwordHash = await bcrypt.hash(validPayload.password, 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: validPayload.name,
      email: validPayload.email,
      passwordHash,
      createdAt,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validPayload.email, password: validPayload.password })
      .expect(200);

    const decoded = jwtService.decode(response.body.data.accessToken as string) as {
      iat: number;
      exp: number;
    };

    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it('POST /auth/login rejects an unknown e-mail with a generic message', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'missing@example.com', password: validPayload.password })
      .expect(401);

    expect(response.body.erro).toBe('Credenciais inválidas');
  });

  it('POST /auth/login rejects a wrong password with the same generic message', async () => {
    const passwordHash = await bcrypt.hash(validPayload.password, 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: validPayload.name,
      email: validPayload.email,
      passwordHash,
      createdAt,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validPayload.email, password: 'weakpass' })
      .expect(401);

    expect(response.body.erro).toBe('Credenciais inválidas');
  });
});
