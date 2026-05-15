import { Inject, Injectable } from '@nestjs/common'
import { CriarSafraInput, ICriarSafraUseCase, ISafraRepository, Safra } from '@apa/core'
import { StatusSafra } from '@apa/shared'
import { randomUUID } from 'crypto'
import { SAFRA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CriarSafraUseCase implements ICriarSafraUseCase {
  constructor(
    @Inject(SAFRA_REPOSITORY)
    private readonly repository: ISafraRepository,
  ) {}

  execute(input: CriarSafraInput): Promise<Safra> {
    const safra = new Safra({
      id: randomUUID(),
      nome: input.nome.trim(),
      floradaId: input.floradaId,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      status: StatusSafra.PLANEJADA,
    })
    return this.repository.save(safra)
  }
}
