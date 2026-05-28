import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public, Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import { AtualizarConfiguracaoLojaUseCase, ObterConfiguracaoLojaUseCase } from '../../../application/use-cases'
import { ATUALIZAR_CONFIGURACAO_LOJA_USE_CASE, OBTER_CONFIGURACAO_LOJA_USE_CASE } from '../../../loja.tokens'
import { AtualizarConfiguracaoLojaInput, ConfiguracaoLoja } from '@apa/core'
import { ConfiguracaoLojaPublicaResponse, ConfiguracaoLojaResponse } from './dto/response.types'

function mapConfiguracaoLoja(c: ConfiguracaoLoja): ConfiguracaoLojaResponse {
  return {
    id: c.id,
    ativaEntregaPrata: c.ativaEntregaPrata,
    ativaRetiradaLocal: c.ativaRetiradaLocal,
    ativaACombinar: c.ativaACombinar,
    ativaCorreios: c.ativaCorreios,
    enderecoRetirada: c.enderecoRetirada,
    horarioAtendimento: c.horarioAtendimento,
    contatoEntrega: c.contatoEntrega,
    pixExpiracaoMinutos: c.pixExpiracaoMinutos,
    mensagemConfirmacao: c.mensagemConfirmacao,
    aceitaPix: c.aceitaPix,
    aceitaCartao: c.aceitaCartao,
    maxParcelas: c.maxParcelas,
    minValorParcela: c.minValorParcela,
    emailResponsavel: c.emailResponsavel,
  }
}

@ApiTags('Loja — Configuração')
@Controller()
export class ConfiguracaoLojaController {
  constructor(
    @Inject(OBTER_CONFIGURACAO_LOJA_USE_CASE)
    private readonly obterConfig: ObterConfiguracaoLojaUseCase,
    @Inject(ATUALIZAR_CONFIGURACAO_LOJA_USE_CASE)
    private readonly atualizarConfig: AtualizarConfiguracaoLojaUseCase,
  ) {}

  @Public()
  @Get('loja/configuracao/publica')
  async publica(): Promise<ConfiguracaoLojaPublicaResponse> {
    const config = await this.obterConfig.execute()
    return {
      ativaEntregaPrata: config.ativaEntregaPrata,
      ativaRetiradaLocal: config.ativaRetiradaLocal,
      ativaACombinar: config.ativaACombinar,
      enderecoRetirada: config.enderecoRetirada,
      horarioAtendimento: config.horarioAtendimento,
      contatoEntrega: config.contatoEntrega,
      aceitaPix: config.aceitaPix,
      aceitaCartao: config.aceitaCartao,
      maxParcelas: config.maxParcelas,
      minValorParcela: config.minValorParcela,
    }
  }

  @Roles(RoleUsuario.ADMIN)
  @Get('loja/admin/configuracao')
  async obter(): Promise<ConfiguracaoLojaResponse> {
    const config = await this.obterConfig.execute()
    return mapConfiguracaoLoja(config)
  }

  @Roles(RoleUsuario.ADMIN)
  @Patch('loja/admin/configuracao')
  @HttpCode(HttpStatus.OK)
  async atualizar(@Body() body: AtualizarConfiguracaoLojaInput): Promise<ConfiguracaoLojaResponse> {
    const config = await this.atualizarConfig.execute(body)
    return mapConfiguracaoLoja(config)
  }
}
