import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ApiErrorResponse {
  statusCode: number;
  erro: string | string[];
}

const PRISMA_MESSAGES: Record<string, string> = {
  P2002: 'Já existe um registro com estes dados.',
  P2025: 'Registro não encontrado.',
};

const GENERIC_MESSAGE = 'Erro interno do servidor.';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const logMessage = `${request.method} ${request.url}`;

    const statusCode = this.resolveStatus(exception);
    const erro = this.resolveMessage(exception);

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        logMessage,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({ statusCode, erro });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    const code = this.readPrismaCode(exception);
    if (code === 'P2002') {
      return HttpStatus.CONFLICT;
    }
    if (code === 'P2025') {
      return HttpStatus.NOT_FOUND;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      return this.extractHttpMessage(exception);
    }

    const code = this.readPrismaCode(exception);
    if (code && PRISMA_MESSAGES[code]) {
      return PRISMA_MESSAGES[code];
    }

    return GENERIC_MESSAGE;
  }

  private extractHttpMessage(exception: HttpException): string | string[] {
    const body = exception.getResponse();

    if (typeof body === 'string') {
      return body;
    }

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = (body as { message?: unknown }).message;
      if (
        typeof message === 'string' ||
        (Array.isArray(message) && message.every((item) => typeof item === 'string'))
      ) {
        return message as string | string[];
      }
    }

    return exception.message;
  }

  private readPrismaCode(exception: unknown): string | undefined {
    if (typeof exception !== 'object' || exception === null) {
      return undefined;
    }

    const candidate = exception as { code?: unknown; name?: unknown };
    if (typeof candidate.code !== 'string') {
      return undefined;
    }
    if (candidate.name !== undefined && candidate.name !== 'PrismaClientKnownRequestError') {
      return undefined;
    }

    return candidate.code;
  }
}
