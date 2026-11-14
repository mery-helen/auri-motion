import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

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

async function validateRegisterDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(RegisterDto, payload);
  return validate(dto);
}

describe('AuthService.register', () => {
  let prisma: PrismaMock;
  let service: AuthService;

  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const validPayload = {
    name: 'Ana Fisioterapeuta',
    email: 'ana@example.com',
    password: 'Senha@123',
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AuthService(prisma as unknown as PrismaService);
  });

  it('creates an account and returns the user without passwordHash', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'user-1',
        ...data,
        createdAt,
      }),
    );

    const result = await service.register(validPayload);

    expect(result).toEqual({
      id: 'user-1',
      name: validPayload.name,
      email: validPayload.email,
      createdAt,
    });
    expect(result).not.toHaveProperty('passwordHash');

    const { data } = prisma.user.create.mock.calls[0][0] as {
      data: { passwordHash: string };
    };
    expect(data.passwordHash).not.toBe(validPayload.password);
    await expect(bcrypt.compare(validPayload.password, data.passwordHash)).resolves.toBe(true);
  });

  it('rejects a registration with an e-mail already in use', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-existing',
      name: 'Existing User',
      email: validPayload.email,
      passwordHash: 'existing-hash',
      createdAt,
    });

    await expect(service.register(validPayload)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('turns a unique constraint error from create into a conflict', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '7.10.1',
          meta: { target: ['email'] },
        },
      ),
    );

    await expect(service.register(validPayload)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });
});

describe('RegisterDto validation', () => {
  it('rejects missing required fields and identifies each one', async () => {
    const errors = await validateRegisterDto({
      name: '',
      email: '',
      password: '',
    });

    const invalidFields = errors.map((error) => error.property);
    expect(invalidFields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('rejects a weak password', async () => {
    const weakPasswords = ['abcdefgh', 'Abcdefg1', 'Abcdefg@', 'Abc@1'];

    for (const password of weakPasswords) {
      const errors = await validateRegisterDto({ ...validPayloadForValidation(), password });
      const passwordError = errors.find((error) => error.property === 'password');
      expect(passwordError, `"${password}" should be rejected`).toBeDefined();
    }
  });

  it('rejects an invalid e-mail format', async () => {
    const errors = await validateRegisterDto({
      ...validPayloadForValidation(),
      email: 'not-an-email',
    });

    const emailError = errors.find((error) => error.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('accepts a valid registration payload', async () => {
    const errors = await validateRegisterDto(validPayloadForValidation());

    expect(errors).toHaveLength(0);
  });
});

function validPayloadForValidation() {
  return {
    name: 'Ana Fisioterapeuta',
    email: 'ana@example.com',
    password: 'Senha@123',
  };
}
