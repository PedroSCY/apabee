import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { StatusSolicitacaoContato } from '@apa/shared'
import {
  CriarSolicitacaoContatoInput,
  ICriarSolicitacaoContatoUseCase,
  ISolicitacaoContatoRepository,
  SolicitacaoContato,
} from '@apa/core'
import { SOLICITACAO_CONTATO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class CriarSolicitacaoContatoUseCase implements ICriarSolicitacaoContatoUseCase {
  constructor(
    @Inject(SOLICITACAO_CONTATO_REPOSITORY) private readonly repo: ISolicitacaoContatoRepository,
  ) {}

  async execute(input: CriarSolicitacaoContatoInput): Promise<SolicitacaoContato> {
    const s = new SolicitacaoContato({
      id: randomUUID(),
      tipo: input.tipo,
      status: StatusSolicitacaoContato.PENDENTE,
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      telefone: input.telefone?.trim() || undefined,
      mensagem: input.mensagem.trim(),
      localizacao: input.localizacao?.trim() || undefined,
      municipio: input.municipio?.trim() || undefined,
      criadoEm: new Date(),
    })
    return this.repo.save(s)
  }
}
