import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { IRegistrarVendaUseCase, IVendaRepository, RegistrarVendaInput, Venda } from '@apa/core'
import { VENDA_REPOSITORY } from '../../comercial.tokens'

// RN11: venda individual gera MovimentoFinanceiro tipo ANTECIPACAO — implementado na Fase 5

@Injectable()
export class RegistrarVendaUseCase implements IRegistrarVendaUseCase {
  constructor(
    @Inject(VENDA_REPOSITORY) private readonly vendaRepo: IVendaRepository,
  ) {}

  async execute(input: RegistrarVendaInput): Promise<Venda> {
    const venda = new Venda({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      tipo: input.tipo,
      volume: input.volume,
      valor: input.valor,
      data: input.data,
      associadoId: input.associadoId,
    })
    venda.validarIndividual()
    return this.vendaRepo.save(venda)
  }
}
