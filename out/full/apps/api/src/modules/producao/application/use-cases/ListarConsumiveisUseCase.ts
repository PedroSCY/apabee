import { Inject, Injectable } from '@nestjs/common'
import { EstoqueMateriaPrima, IEstoqueMateriaPrimaRepository, IListarConsumiveisUseCase, ITipoMateriaPrimaRepository, TipoMateriaPrima } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'
import { ESTOQUE_MATERIA_PRIMA_REPOSITORY, TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Lista tipos de matéria-prima com unidade UNIDADE (consumíveis) e seus saldos de estoque. */
export class ListarConsumiveisUseCase implements IListarConsumiveisUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepo: IEstoqueMateriaPrimaRepository,
  ) {}

  async execute(): Promise<{ tipo: TipoMateriaPrima; estoque: EstoqueMateriaPrima | null }[]> {
    const todos = await this.tipoRepo.findAll()
    const consumiveis = todos.filter(t => t.unidade === UnidadeMedida.UNIDADE)

    return Promise.all(
      consumiveis.map(async tipo => ({
        tipo,
        estoque: await this.estoqueRepo.findByTipo(tipo.id),
      })),
    )
  }
}
