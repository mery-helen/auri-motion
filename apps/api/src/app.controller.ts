import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna a mensagem de saudação da API.' })
  @ApiResponse({ status: 200, description: 'Saudação retornada com sucesso.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
