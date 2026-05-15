import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  DefinirPrecoSafraInput,
  IDefinirPrecoSafraUseCase,
  IPrecoSafraRepository,
  ISafraRepository,
  ITipoMateriaPrimaRepository,
  PrecoSafra,
} from '@apa/core'
import { randomUUID } from 'crypto'
import {
  PRECO_SAFRA_REPOSITORY,
  SAFRA_REPOSITORY,
  TIPO_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
export class DefinirPrecoSafraUseCase implements IDefinirPrecoSafraUseCase {
  constructor(
    @Inject(PRECO_SAFRA_REPOSITORY)
    private readonly precoRepo: IPrecoSafraRepository,
    @Inject(SAFRA_REPOSITORY)
    private readonly safraRepo: ISafraRepository,
    @Inject(TIPO_MATERIA_PRIMA_REPOSITORY)
    private readonly tipoRepo: ITipoMateriaPrimaRepository,
  ) {}

  async execute(input: DefinirPrecoSafraInput): Promise<PrecoSafra> {
    const [safra, tipo] = await Promise.all([
      this.safraRepo.findById(input.safraId),
      this.tipoRepo.findById(input.tipoMateriaPrimaId),
    ])
    if (!safra) throw new NotFoundException('Safra não encontrada')
    if (!tipo) throw new NotFoundException('Tipo de matéria-prima não encontrado')

    const existente = await this.precoRepo.findByTipoESafra(input.tipoMateriaPrimaId, input.safraId)
    if (existente) return this.precoRepo.update(existente.atualizar(input.preco))

    return this.precoRepo.save(
      new PrecoSafra({ id: randomUUID(), tipoMateriaPrimaId: input.tipoMateriaPrimaId, safraId: input.safraId, preco: input.preco }),
    )
  }
}
