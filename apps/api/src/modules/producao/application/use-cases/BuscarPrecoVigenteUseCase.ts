import { Inject, Injectable } from '@nestjs/common'
import {
  IBuscarPrecoVigenteUseCase,
  IPrecoSafraRepository,
  ITipoMateriaPrimaRepository,
} from '@apa/core'
import { PRECO_SAFRA_REPOSITORY, TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class BuscarPrecoVigenteUseCase implements IBuscarPrecoVigenteUseCase {
  constructor(
    @Inject(PRECO_SAFRA_REPOSITORY)
    private readonly precoRepo: IPrecoSafraRepository,
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
  ) {}

  async execute(tipoMateriaPrimaId: string, safraId: string): Promise<number | null> {
    const precoSafra = await this.precoRepo.findByTipoESafra(tipoMateriaPrimaId, safraId)
    if (precoSafra) return precoSafra.preco
    const tipo = await this.tipoRepo.findById(tipoMateriaPrimaId)
    return tipo?.precoAtual ?? null
  }
}
