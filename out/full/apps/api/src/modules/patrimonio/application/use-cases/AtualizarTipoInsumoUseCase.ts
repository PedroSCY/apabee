import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { AtualizarTipoInsumoInput, IAtualizarTipoInsumoUseCase, ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { TIPO_INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class AtualizarTipoInsumoUseCase implements IAtualizarTipoInsumoUseCase {
  constructor(
    @Inject(TIPO_INSUMO_REPOSITORY)
    private readonly tipoInsumoRepository: ITipoInsumoRepository,
  ) {}

  async execute(id: string, input: AtualizarTipoInsumoInput): Promise<TipoInsumo> {
    const tipo = await this.tipoInsumoRepository.findById(id)
    if (!tipo) throw new NotFoundException('Tipo de insumo não encontrado.')
    const atualizado = tipo.atualizarDados({
      nome: input.nome,
      descricao: input.descricao,
      sigla: input.sigla ? input.sigla.toUpperCase().trim() : undefined,
    })
    return this.tipoInsumoRepository.update(atualizado)
  }
}
