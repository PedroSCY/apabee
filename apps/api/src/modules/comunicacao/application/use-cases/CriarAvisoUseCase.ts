import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Aviso, CriarAvisoInput, IAvisoRepository, ICriarAvisoUseCase } from '@apa/core'
import { DestinatariosAviso } from '@apa/shared'
import { AVISO_REPOSITORY } from '../../comunicacao.tokens'

@Injectable()
export class CriarAvisoUseCase implements ICriarAvisoUseCase {
  constructor(
    @Inject(AVISO_REPOSITORY) private readonly avisoRepo: IAvisoRepository,
  ) {}

  async execute(input: CriarAvisoInput): Promise<Aviso> {
    const aviso = new Aviso({
      id: randomUUID(),
      titulo: input.titulo.trim(),
      conteudo: input.conteudo.trim(),
      categoria: input.categoria,
      publicado: input.publicado ?? false,
      fixado: input.fixado ?? false,
      destinatarios: input.destinatarios ?? DestinatariosAviso.TODOS,
      enviarEmail: input.enviarEmail ?? false,
      emailEnviado: false,
      selectedMemberIds: input.selectedMemberIds ?? [],
      dataReuniao: input.dataReuniao,
      horarioReuniao: input.horarioReuniao,
      localReuniao: input.localReuniao,
      criadoEm: new Date(),
    })
    return this.avisoRepo.save(aviso)
  }
}
