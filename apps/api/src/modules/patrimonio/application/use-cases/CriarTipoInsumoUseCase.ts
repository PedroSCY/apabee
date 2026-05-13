import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { CriarTipoInsumoInput, ICriarTipoInsumoUseCase, ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { randomUUID } from 'crypto'
import { TIPO_INSUMO_REPOSITORY } from '../../patrimonio.tokens'

@Injectable()
export class CriarTipoInsumoUseCase implements ICriarTipoInsumoUseCase {
  constructor(
    @Inject(TIPO_INSUMO_REPOSITORY)
    private readonly tipoInsumoRepository: ITipoInsumoRepository,
  ) {}

  async execute(input: CriarTipoInsumoInput): Promise<TipoInsumo> {
    const sigla = input.sigla.toUpperCase().trim()
    const existente = await this.tipoInsumoRepository.findBySigla(sigla)
    if (existente) throw new ConflictException(`Já existe um tipo de insumo com a sigla "${sigla}".`)

    const tipo = new TipoInsumo({
      id: randomUUID(),
      nome: input.nome.trim(),
      descricao: input.descricao?.trim(),
      categoria: input.categoria,
      sigla,
      criadoEm: new Date(),
    })
    return this.tipoInsumoRepository.save(tipo)
  }
}
