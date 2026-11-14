import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
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

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaMock;

  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const validPayload = {
    name: 'Ana Fisioterapeuta',
    email: 'ana@example.com',
    password: 'Senha@123',
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
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

    expect(response.body).toEqual({
      id: 'user-1',
      name: validPayload.name,
      email: validPayload.email,
      createdAt: createdAt.toISOString(),
    });
    expect(response.body).not.toHaveProperty('passwordHash');
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

    expect(response.body.message).toBe('E-mail já está em uso.');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('POST /auth/register rejects missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: '', password: '' })
      .expect(400);

    expect(response.body.message).toEqual(
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

    expect(response.body.message).toContain('E-mail inválido.');
  });

  it('POST /auth/register rejects a weak password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, password: 'weakpass' })
      .expect(400);

    expect(response.body.message).toContain(
      'A senha deve ter no mínimo 8 caracteres, com ao menos 1 letra maiúscula, 1 número e 1 caractere especial.',
    );
  });
});
