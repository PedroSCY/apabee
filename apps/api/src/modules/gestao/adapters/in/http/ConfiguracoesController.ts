import { Body, Controller, Get, Inject, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import { ConfiguracaoAssociacao, IAtualizarConfiguracaoUseCase, IObterConfiguracaoUseCase } from '@apa/core'
import { ATUALIZAR_CONFIGURACAO_USE_CASE, OBTER_CONFIGURACAO_USE_CASE } from '../../../gestao.tokens'
import { AtualizarConfiguracaoDto } from './dto/AtualizarConfiguracaoDto'
import { ConfiguracaoAssociacaoResponse } from './dto/response.types'

@ApiTags('Gestão — Configurações')
@ApiBearerAuth('JWT')
@Controller('gestao/configuracoes')
export class ConfiguracoesController {
  constructor(
    @Inject(OBTER_CONFIGURACAO_USE_CASE) private readonly obter: IObterConfiguracaoUseCase,
    @Inject(ATUALIZAR_CONFIGURACAO_USE_CASE) private readonly atualizar: IAtualizarConfiguracaoUseCase,
  ) {}

  @ApiOperation({ summary: 'Obter configurações da associação', description: 'Retorna nome, CNPJ, contato e tokens de tema (cores CSS) da APA. Acessível para todos os autenticados.' })
  @ApiResponse({ status: 200, description: 'Configuração atual.' })
  @Get()
  async obterConfiguracao(): Promise<ConfiguracaoAssociacaoResponse> {
    return this.toResponse(await this.obter.execute())
  }

  @ApiOperation({ summary: 'Atualizar configurações da associação (ADMIN)', description: 'Atualiza nome, CNPJ, contato, cores do tema e parâmetros de mensalidade. Campos omitidos não são alterados.' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada.' })
  @ApiResponse({ status: 403, description: 'Sem permissão (requer ADMIN).' })
  @Patch()
  @Roles(RoleUsuario.ADMIN)
  async atualizarConfiguracao(@Body() dto: AtualizarConfiguracaoDto): Promise<ConfiguracaoAssociacaoResponse> {
    return this.toResponse(await this.atualizar.execute(dto))
  }

  private toResponse(c: ConfiguracaoAssociacao): ConfiguracaoAssociacaoResponse {
    return {
      id: c.id,
      nomeExibido: c.nomeExibido,
      cnpj: c.cnpj,
      email: c.email,
      telefone: c.telefone,
      endereco: c.endereco,
      corFundo: c.corFundo,
      corTexto: c.corTexto,
      corPrimaria: c.corPrimaria,
      corPrimariaForeground: c.corPrimariaForeground,
      corSidebar: c.corSidebar,
      corAccent: c.corAccent,
      valorMensalidade: c.valorMensalidade,
      diaVencimento: c.diaVencimento,
      atualizadoEm: c.atualizadoEm,
    }
  }
}
