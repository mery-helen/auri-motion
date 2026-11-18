import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

const ORIGINAL_MESSAGE = 'Unique constraint failed on the fields: (`User`.`email`)';
const ORIGINAL_STACK = `${ORIGINAL_MESSAGE}\n    at PrismaClientKnownRequestError (/app/dist/prisma/client.js:12:34)`;

type ResponseMock = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function createPrismaErrorFake(code: string): Error & { code: string; meta: unknown } {
  const error = new Error(ORIGINAL_MESSAGE) as Error & { code: string; meta: unknown };
  error.name = 'PrismaClientKnownRequestError';
  error.stack = ORIGINAL_STACK;
  error.code = code;
  error.meta = { target: ['email'], modelName: 'User' };
  return error;
}

function createHost(): { host: ArgumentsHost; response: ResponseMock } {
  const response: ResponseMock = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const request = { method: 'POST', url: '/auth/register' };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['P2002', HttpStatus.CONFLICT],
    ['P2025', HttpStatus.NOT_FOUND],
  ])(
    'maps a Prisma %s error to HTTP %i without leaking its message or stack',
    (code, expectedStatus) => {
      const { host, response } = createHost();

      filter.catch(createPrismaErrorFake(code), host);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      const [body] = response.json.mock.calls[0] as [{ statusCode: number; erro: unknown }];
      expect(body.statusCode).toBe(expectedStatus);
      expect(typeof body.erro).toBe('string');

      const payload = JSON.stringify(body);
      expect(payload).not.toContain(ORIGINAL_MESSAGE);
      expect(payload).not.toContain(ORIGINAL_STACK);
      expect(payload).not.toContain('PrismaClientKnownRequestError');
      expect(payload).not.toContain('User');
      expect(payload).not.toContain('email');
      expect(payload).not.toContain('dist/prisma');
      expect(Logger.prototype.warn).toHaveBeenCalled();
    },
  );

  it('returns a generic 500 for an unexpected error', () => {
    const { host, response } = createHost();
    const unexpected = new Error('postgres://user:secret@host:5432/db at /app/dist/prisma.js');

    filter.catch(unexpected, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      erro: 'Erro interno do servidor.',
    });
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'POST /auth/register',
      unexpected.stack,
    );
  });
});
