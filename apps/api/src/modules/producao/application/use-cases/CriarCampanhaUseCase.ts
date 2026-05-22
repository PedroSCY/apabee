import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Campanha, CriarCampanhaInput, ICampanhaRepository, ICriarCampanhaUseCase } from '@apa/core'
import { StatusCampanha, TipoLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class CriarCampanhaUseCase implements ICriarCampanhaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly repository: ICampanhaRepository,
  ) {}

  async execute(input: CriarCampanhaInput): Promise<Campanha> {
    if (input.tipo === TipoLote.AQUISICAO && !input.valorMeta)
      throw new BadRequestException('Campanha de AQUISICAO requer valorMeta')

    const codigo = await this.gerarCodigo(input)

    const campanha = new Campanha({
      id: randomUUID(),
      codigo,
      nome: input.nome.trim(),
      tipo: input.tipo,
      safraId: input.safraId,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      status: StatusCampanha.PLANEJADA,
      destinatario: input.destinatario,
      valorMeta: input.valorMeta,
      prazoContribuicao: input.prazoContribuicao,
      valorMinimo: input.valorMinimo,
      valorMaximo: input.valorMaximo,
      receitaTotal: 0,
      custoTotal: 0,
      criadoEm: new Date(),
    })
    return this.repository.save(campanha)
  }

  /** Gera código único no formato {TIPO}-{ANO}-{SEQUENCIAL}. Exemplo: PROD-2025-001. */
  private async gerarCodigo(input: CriarCampanhaInput): Promise<string> {
    const ano = input.dataInicio.getFullYear()
    const prefixo = input.tipo === TipoLote.PRODUCAO ? 'PROD' : 'AQUI'
    const todas = await this.repository.findAll()
    const doAno = todas.filter(c => c.codigo.includes(`${prefixo}-${ano}`))
    const sequencial = String(doAno.length + 1).padStart(3, '0')
    return `${prefixo}-${ano}-${sequencial}`
  }
}
