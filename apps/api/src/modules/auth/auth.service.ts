import { ConflictException, UnauthorizedException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { parseJwtExpiresInSeconds } from './jwt-expires-in.js';

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisteredUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já está em uso.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('E-mail já está em uso.');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; expiresIn: number }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const expiresIn = parseJwtExpiresInSeconds(
      this.configService.getOrThrow('JWT_EXPIRES_IN'),
    );
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        expiresIn,
      },
    );

    return { accessToken, expiresIn };
  }
}