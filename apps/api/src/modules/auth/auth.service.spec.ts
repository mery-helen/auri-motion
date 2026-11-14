import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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

type JwtServiceMock = {
  signAsync: ReturnType<typeof vi.fn>;
};

type ConfigServiceMock = {
  get: ReturnType<typeof vi.fn>;
};

function createPrismaMock(): PrismaMock {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
}

function createJwtServiceMock(): JwtServiceMock {
  return { signAsync: vi.fn() };
}

function createConfigServiceMock(): ConfigServiceMock {
  const values: Record<string, string> = {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '3600',
  };

  return {
    get: vi.fn((key: string) => values[key]),
    getOrThrow: vi.fn((key: string) => values[key]),
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
    service = new AuthService(
      prisma as unknown as PrismaService,
      createJwtServiceMock() as unknown as JwtService,
      createConfigServiceMock() as unknown as ConfigService,
    );
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

describe('AuthService.login', () => {
  let prisma: PrismaMock;
  let jwtService: JwtServiceMock;
  let configService: ConfigServiceMock;
  let service: AuthService;
  let passwordHash: string;

  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const validPayload = {
    email: 'ana@example.com',
    password: 'Senha@123',
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(validPayload.password, 10);
  });

  beforeEach(() => {
    prisma = createPrismaMock();
    jwtService = createJwtServiceMock();
    configService = createConfigServiceMock();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('returns an access token and a one-hour expiry for valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Ana Fisioterapeuta',
      email: validPayload.email,
      passwordHash,
      createdAt,
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    const result = await service.login(validPayload);

    expect(result).toEqual({ accessToken: 'signed-token', expiresIn: 3600 });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 'user-1' },
      { expiresIn: '3600' },
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: validPayload.email },
    });
  });

  it('uses the same generic message for an unknown e-mail and a wrong password', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    const unknownEmailError = await service
      .login({ email: 'missing@example.com', password: validPayload.password })
      .catch((error: unknown) => error);

    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Ana Fisioterapeuta',
      email: validPayload.email,
      passwordHash,
      createdAt,
    });

    const wrongPasswordError = await service
      .login({ email: validPayload.email, password: 'Wrong@123' })
      .catch((error: unknown) => error);

    expect(unknownEmailError).toBeInstanceOf(UnauthorizedException);
    expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
    expect((unknownEmailError as UnauthorizedException).message).toBe(
      'Credenciais inválidas',
    );
    expect((wrongPasswordError as UnauthorizedException).message).toBe(
      (unknownEmailError as UnauthorizedException).message,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
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
