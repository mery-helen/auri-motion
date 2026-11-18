import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService, RegisteredUser } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Cadastra um fisioterapeuta e retorna os dados da conta criada.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      valido: {
        summary: 'Cadastro válido',
        value: {
          name: 'Ana Fisioterapeuta',
          email: 'ana@example.com',
          password: 'Senha@123',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de cadastro inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  register(@Body() dto: RegisterDto): Promise<RegisteredUser> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Autentica o fisioterapeuta e retorna um token de acesso.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      valido: {
        summary: 'Credenciais válidas',
        value: {
          email: 'ana@example.com',
          password: 'Senha@123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Credenciais em formato inválido.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  login(@Body() dto: LoginDto): Promise<{ accessToken: string; expiresIn: number }> {
    return this.authService.login(dto);
  }
}
