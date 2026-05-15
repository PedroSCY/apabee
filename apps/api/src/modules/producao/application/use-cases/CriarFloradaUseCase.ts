import { Inject, Injectable } from '@nestjs/common'
import { CriarFloradaInput, Florada, ICriarFloradaUseCase, IFloradaRepository } from '@apa/core'
import { randomUUID } from 'crypto'
import { FLORADA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CriarFloradaUseCase implements ICriarFloradaUseCase {
  constructor(
    @Inject(FLORADA_REPOSITORY)
    private readonly repository: IFloradaRepository,
  ) {}

  execute(input: CriarFloradaInput): Promise<Florada> {
    const florada = new Florada({
      id: randomUUID(),
      nome: input.nome.trim(),
      descricao: input.descricao?.trim(),
      ativa: true,
      criadoEm: new Date(),
    })
    return this.repository.save(florada)
  }
}
