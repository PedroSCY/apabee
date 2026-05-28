import { Injectable } from '@nestjs/common'
import { AtualizarConfiguracaoLojaInput, ConfiguracaoLoja, IConfiguracaoLojaRepository } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

const DEFAULTS: Omit<ConfiguracaoLoja, 'id'> = {
  ativaEntregaPrata: true,
  ativaRetiradaLocal: true,
  ativaACombinar: true,
  ativaCorreios: false,
  pixExpiracaoMinutos: 30,
  aceitaPix: true,
  aceitaCartao: true,
  maxParcelas: 3,
  minValorParcela: 10,
}

@Injectable()
export class PrismaConfiguracaoLojaRepository implements IConfiguracaoLojaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obter(): Promise<ConfiguracaoLoja> {
    const r = await this.prisma.configuracaoLoja.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...DEFAULTS },
      update: {},
    })
    return this.toDomain(r)
  }

  async atualizar(input: AtualizarConfiguracaoLojaInput): Promise<ConfiguracaoLoja> {
    const data: any = {}
    if (input.ativaEntregaPrata !== undefined) data.ativaEntregaPrata = input.ativaEntregaPrata
    if (input.ativaRetiradaLocal !== undefined) data.ativaRetiradaLocal = input.ativaRetiradaLocal
    if (input.ativaACombinar !== undefined) data.ativaACombinar = input.ativaACombinar
    if (input.ativaCorreios !== undefined) data.ativaCorreios = input.ativaCorreios
    if (input.enderecoRetirada !== undefined) data.enderecoRetirada = input.enderecoRetirada
    if (input.horarioAtendimento !== undefined) data.horarioAtendimento = input.horarioAtendimento
    if (input.contatoEntrega !== undefined) data.contatoEntrega = input.contatoEntrega
    if (input.pixExpiracaoMinutos !== undefined) data.pixExpiracaoMinutos = input.pixExpiracaoMinutos
    if (input.mensagemConfirmacao !== undefined) data.mensagemConfirmacao = input.mensagemConfirmacao
    if (input.aceitaPix !== undefined) data.aceitaPix = input.aceitaPix
    if (input.aceitaCartao !== undefined) data.aceitaCartao = input.aceitaCartao
    if (input.maxParcelas !== undefined) data.maxParcelas = input.maxParcelas
    if (input.minValorParcela !== undefined) data.minValorParcela = input.minValorParcela
    if (input.emailResponsavel !== undefined) data.emailResponsavel = input.emailResponsavel

    const r = await this.prisma.configuracaoLoja.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...DEFAULTS, ...data },
      update: data,
    })
    return this.toDomain(r)
  }

  private toDomain(r: any): ConfiguracaoLoja {
    return {
      id: r.id,
      ativaEntregaPrata: r.ativaEntregaPrata,
      ativaRetiradaLocal: r.ativaRetiradaLocal,
      ativaACombinar: r.ativaACombinar,
      ativaCorreios: r.ativaCorreios,
      enderecoRetirada: r.enderecoRetirada ?? undefined,
      horarioAtendimento: r.horarioAtendimento ?? undefined,
      contatoEntrega: r.contatoEntrega ?? undefined,
      pixExpiracaoMinutos: r.pixExpiracaoMinutos,
      mensagemConfirmacao: r.mensagemConfirmacao ?? undefined,
      aceitaPix: r.aceitaPix,
      aceitaCartao: r.aceitaCartao,
      maxParcelas: r.maxParcelas,
      minValorParcela: Number(r.minValorParcela),
      emailResponsavel: r.emailResponsavel ?? undefined,
    }
  }
}
