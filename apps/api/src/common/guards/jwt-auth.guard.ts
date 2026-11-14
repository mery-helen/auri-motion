import { AuthGuard } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard('jwt') {}