import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  EstoqueMateriaPrima,
  IEstoqueMateriaPrimaRepository,
  IRegistrarEntradaConsumivelUseCase,
  ITipoMateriaPrimaRepository,
  MovimentacaoEstoque,
  RegistrarEntradaConsumivelInput,
} from '@apa/core'
import { TipoMovimentacao } from '@apa/shared'
import { randomUUID } from 'crypto'
import { ESTOQUE_MATERIA_PRIMA_REPOSITORY, TIPO_MATERIA_PRIMA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RegistrarEntradaConsumivelUseCase implements IRegistrarEntradaConsumivelUseCase {
  constructor(
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly estoqueRepo: IEstoqueMateriaPrimaRepository,
  ) {}

  async execute(input: RegistrarEntradaConsumivelInput): Promise<EstoqueMateriaPrima> {
    const tipo = await this.tipoRepo.findById(input.tipoMateriaPrimaId)
    if (!tipo) throw new NotFoundException('Tipo de matéria-prima não encontrado')

    let estoque = await this.estoqueRepo.findByTipo(input.tipoMateriaPrimaId)

    if (estoque) {
      estoque = await this.estoqueRepo.update(estoque.entrada(input.quantidade))
    } else {
      estoque = await this.estoqueRepo.save(
        new EstoqueMateriaPrima({
          id: randomUUID(),
          tipoMateriaPrimaId: input.tipoMateriaPrimaId,
          quantidadeDisponivel: input.quantidade,
          unidade: tipo.unidade,
          atualizadoEm: new Date(),
        }),
      )
    }

    await this.estoqueRepo.salvarMovimentacao(
      new MovimentacaoEstoque({
        id: randomUUID(),
        estoqueId: estoque.id,
        tipo: TipoMovimentacao.ENTRADA,
        quantidade: input.quantidade,
        referenciaId: input.referenciaId,
        criadoEm: new Date(),
      }),
    )

    return estoque
  }
}
