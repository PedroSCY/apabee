import { Body, Controller, Get, Inject, Patch } from '@nestjs/common'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import { IObterConfiguracaoUseCase, IAtualizarConfiguracaoUseCase } from '@apa/core'
import { OBTER_CONFIGURACAO_USE_CASE, ATUALIZAR_CONFIGURACAO_USE_CASE } from '../../../gestao.tokens'
import { AtualizarConfiguracaoDto } from './dto/AtualizarConfiguracaoDto'

@Controller('gestao/configuracoes')
export class ConfiguracoesController {
  constructor(
    @Inject(OBTER_CONFIGURACAO_USE_CASE) private readonly obter: IObterConfiguracaoUseCase,
    @Inject(ATUALIZAR_CONFIGURACAO_USE_CASE) private readonly atualizar: IAtualizarConfiguracaoUseCase,
  ) {}

  @Get()
  async obterConfiguracao() {
    return this.obter.execute()
  }

  @Patch()
  @Roles(RoleUsuario.ADMIN)
  async atualizarConfiguracao(@Body() dto: AtualizarConfiguracaoDto) {
    return this.atualizar.execute(dto)
  }
}
