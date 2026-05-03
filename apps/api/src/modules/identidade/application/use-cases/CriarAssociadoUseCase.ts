import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Associado,
  CriarAssociadoInput,
  IAssociadoRepository,
  ICriarAssociadoUseCase,
  IUsuarioRepository,
} from '@apa/core'
import { StatusAssociado } from '@apa/shared'
import { ASSOCIADO_REPOSITORY, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
export class CriarAssociadoUseCase implements ICriarAssociadoUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
  ) {}

  async execute(input: CriarAssociadoInput): Promise<Associado> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId)
    if (!usuario) throw new NotFoundException('Usuário não encontrado')
    if (!usuario.isAssociado())
      throw new BadRequestException('Usuário deve ter role ASSOCIADO')

    const associado = new Associado({
      id: crypto.randomUUID(),
      usuario,
      dataIngresso: input.dataIngresso ?? new Date(),
      observacoes: input.observacoes,
      status: StatusAssociado.ATIVO,
    })

    return this.associadoRepository.save(associado)
  }
}
