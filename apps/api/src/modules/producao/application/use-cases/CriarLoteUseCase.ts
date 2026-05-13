import { Inject, Injectable } from '@nestjs/common'
import { CriarLoteInput, ICriarLoteUseCase, ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { StatusLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import { LOTE_PRODUCAO_REPOSITORY } from '../../producao.tokens'

@Injectable()
/** Cria um novo lote de produção ou aquisição com status ABERTO. */
export class CriarLoteUseCase implements ICriarLoteUseCase {
  constructor(
    @Inject(LOTE_PRODUCAO_REPOSITORY)
    private readonly repository: ILoteProducaoRepository,
  ) {}

  /** Executa a criação e persiste o lote. */
  execute(input: CriarLoteInput): Promise<LoteProducao> {
    const lote = new LoteProducao({
      id: randomUUID(),
      tipo: input.tipo,
      periodo: input.periodo.trim(),
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      status: StatusLote.ABERTO,
      custoTotal: 0,
    })
    return this.repository.save(lote)
  }
}
