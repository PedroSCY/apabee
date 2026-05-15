import { Injectable } from '@nestjs/common'
import { ApuracaoCampanha, IApuracaoCampanhaRepository, RateioCampanha } from '@apa/core'
import { PrismaService } from '../../../../../shared/database/prisma.service'

@Injectable()
export class PrismaApuracaoCampanhaRepository implements IApuracaoCampanhaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCampanha(campanhaId: string): Promise<ApuracaoCampanha | null> {
    const r = await this.prisma.apuracaoCampanha.findUnique({ where: { campanhaId }, include: { rateios: true } })
    return r ? this.toDomain(r) : null
  }

  async save(apuracao: ApuracaoCampanha): Promise<ApuracaoCampanha> {
    const r = await this.prisma.apuracaoCampanha.create({
      data: {
        id: apuracao.id, campanhaId: apuracao.campanhaId, faturamentoTotal: apuracao.faturamentoTotal,
        custoTotal: apuracao.custoTotal, lucroLiquido: apuracao.lucroLiquido, liquidadoEm: apuracao.liquidadoEm,
        rateios: {
          create: apuracao.rateios.map(rat => ({
            id: crypto.randomUUID(),
            associadoId: rat.associadoId, contribuicaoTotal: rat.contribuicaoTotal,
            percentual: rat.percentual, valorBruto: rat.valorBruto, custosRateados: rat.custosRateados,
            antecipacoes: rat.antecipacoes, valorFinal: rat.valorFinal,
          })),
        },
      },
      include: { rateios: true },
    })
    return this.toDomain(r)
  }

  private toDomain(r: any): ApuracaoCampanha {
    const rateios: RateioCampanha[] = (r.rateios ?? []).map((rat: any) => ({
      associadoId: rat.associadoId, contribuicaoTotal: Number(rat.contribuicaoTotal),
      percentual: Number(rat.percentual), valorBruto: Number(rat.valorBruto),
      custosRateados: Number(rat.custosRateados), antecipacoes: Number(rat.antecipacoes),
      valorFinal: Number(rat.valorFinal),
    }))
    return new ApuracaoCampanha({
      id: r.id, campanhaId: r.campanhaId, faturamentoTotal: Number(r.faturamentoTotal),
      custoTotal: Number(r.custoTotal), lucroLiquido: Number(r.lucroLiquido),
      liquidadoEm: r.liquidadoEm, rateios,
    })
  }
}
