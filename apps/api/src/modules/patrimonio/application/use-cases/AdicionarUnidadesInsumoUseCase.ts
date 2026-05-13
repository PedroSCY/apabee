import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  AdicionarUnidadesInsumoInput,
  IAdicionarUnidadesInsumoUseCase,
  IInsumoRepository,
  ITipoInsumoRepository,
  Insumo,
} from '@apa/core'
import { StatusPatrimonio } from '@apa/shared'
import { INSUMO_REPOSITORY, TIPO_INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class AdicionarUnidadesInsumoUseCase implements IAdicionarUnidadesInsumoUseCase {
  constructor(
    @Inject(TIPO_INSUMO_REPOSITORY)
    private readonly tipoInsumoRepository: ITipoInsumoRepository,
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(input: AdicionarUnidadesInsumoInput): Promise<Insumo[]> {
    if (input.quantidade < 1 || input.quantidade > 100) {
      throw new BadRequestException('Quantidade deve ser entre 1 e 100 unidades.')
    }

    const tipo = await this.tipoInsumoRepository.findById(input.tipoInsumoId)
    if (!tipo) throw new NotFoundException('Tipo de insumo não encontrado.')

    const maxSequencia = await this.insumoRepository.maxSequenceByTipo(input.tipoInsumoId)

    const novas: Insumo[] = []
    for (let i = 0; i < input.quantidade; i++) {
      const numero = maxSequencia + i + 1
      const identificador = `${tipo.sigla}-${String(numero).padStart(3, '0')}`
      novas.push(
        new Insumo({
          id: randomUUID(),
          identificador,
          tipoInsumoId: tipo.id,
          tipoInsumo: tipo,
          descricao: input.descricao?.trim(),
          status: StatusPatrimonio.DISPONIVEL,
          criadoEm: new Date(),
        }),
      )
    }

    return this.insumoRepository.saveMany(novas)
  }
}
