import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IExcluirTipoInsumoUseCase, IInsumoRepository, ITipoInsumoRepository } from '@apa/core'
import { INSUMO_REPOSITORY, TIPO_INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class ExcluirTipoInsumoUseCase implements IExcluirTipoInsumoUseCase {
  constructor(
    @Inject(TIPO_INSUMO_REPOSITORY)
    private readonly tipoInsumoRepository: ITipoInsumoRepository,
    @Inject(INSUMO_REPOSITORY)
    private readonly insumoRepository: IInsumoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const tipo = await this.tipoInsumoRepository.findById(id)
    if (!tipo) throw new NotFoundException('Tipo de insumo não encontrado.')

    const unidades = await this.insumoRepository.findAll(id)
    if (unidades.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir: existem ${unidades.length} unidade(s) vinculadas a este tipo.`,
      )
    }

    await this.tipoInsumoRepository.delete(id)
  }
}
