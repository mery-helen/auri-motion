import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

const STRONG_PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export class RegisterDto {
  @IsString({ message: 'Nome é obrigatório.' })
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @IsString({ message: 'Senha é obrigatória.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @Matches(STRONG_PASSWORD_PATTERN, {
    message:
      'A senha deve ter no mínimo 8 caracteres, com ao menos 1 letra maiúscula, 1 número e 1 caractere especial.',
  })
  password: string;
}
