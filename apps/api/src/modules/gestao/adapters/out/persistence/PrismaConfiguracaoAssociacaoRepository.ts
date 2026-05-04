import { Injectable } from '@nestjs/common'
import { ConfiguracaoAssociacao as PrismaConfig } from '@prisma/client'
import { IConfiguracaoAssociacaoRepository, ConfiguracaoAssociacao } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaConfiguracaoAssociacaoRepository implements IConfiguracaoAssociacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(): Promise<ConfiguracaoAssociacao | null> {
    const record = await this.prisma.configuracaoAssociacao.findFirst()
    return record ? this.toDomain(record) : null
  }

  async save(config: ConfiguracaoAssociacao): Promise<ConfiguracaoAssociacao> {
    const record = await this.prisma.configuracaoAssociacao.create({
      data: {
        id: config.id,
        nomeExibido: config.nomeExibido,
        cnpj: config.cnpj ?? null,
        email: config.email ?? null,
        telefone: config.telefone ?? null,
        endereco: config.endereco ?? null,
        corFundo: config.corFundo ?? null,
        corTexto: config.corTexto ?? null,
        corPrimaria: config.corPrimaria ?? null,
        corPrimariaForeground: config.corPrimariaForeground ?? null,
        corSidebar: config.corSidebar ?? null,
        corAccent: config.corAccent ?? null,
      },
    })
    return this.toDomain(record)
  }

  async update(config: ConfiguracaoAssociacao): Promise<ConfiguracaoAssociacao> {
    const record = await this.prisma.configuracaoAssociacao.update({
      where: { id: config.id },
      data: {
        nomeExibido: config.nomeExibido,
        cnpj: config.cnpj ?? null,
        email: config.email ?? null,
        telefone: config.telefone ?? null,
        endereco: config.endereco ?? null,
        corFundo: config.corFundo ?? null,
        corTexto: config.corTexto ?? null,
        corPrimaria: config.corPrimaria ?? null,
        corPrimariaForeground: config.corPrimariaForeground ?? null,
        corSidebar: config.corSidebar ?? null,
        corAccent: config.corAccent ?? null,
      },
    })
    return this.toDomain(record)
  }

  private toDomain(record: PrismaConfig): ConfiguracaoAssociacao {
    return new ConfiguracaoAssociacao({
      id: record.id,
      nomeExibido: record.nomeExibido,
      cnpj: record.cnpj ?? undefined,
      email: record.email ?? undefined,
      telefone: record.telefone ?? undefined,
      endereco: record.endereco ?? undefined,
      corFundo: record.corFundo ?? undefined,
      corTexto: record.corTexto ?? undefined,
      corPrimaria: record.corPrimaria ?? undefined,
      corPrimariaForeground: record.corPrimariaForeground ?? undefined,
      corSidebar: record.corSidebar ?? undefined,
      corAccent: record.corAccent ?? undefined,
      atualizadoEm: record.atualizadoEm,
    })
  }
}
