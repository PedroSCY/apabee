import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Associado,
  CriarAssociadoInput,
  IAssociadoRepository,
  ICriarAssociadoUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import { StatusAssociado } from '@apa/shared'
import { ASSOCIADO_REPOSITORY, PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Vincula um usuário existente como associado da APA */
export class CriarAssociadoUseCase implements ICriarAssociadoUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a criação do associado com validações de role e duplicidade */
  async execute(input: CriarAssociadoInput): Promise<Associado> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId)
    if (!usuario) throw new NotFoundException('Usuário não encontrado')
    if (!usuario.isAssociado())
      throw new BadRequestException('Usuário deve ter role ASSOCIADO')

    const existente = await this.associadoRepository.findByUsuarioId(input.usuarioId)
    if (existente) throw new ConflictException('Usuário já é associado')

    const associado = new Associado({
      id: crypto.randomUUID(),
      usuario,
      cpf: input.cpf,
      dataIngresso: input.dataIngresso ?? new Date(),
      observacoes: input.observacoes,
      status: StatusAssociado.ATIVO,
    })

    const salvo = await this.associadoRepository.save(associado)
    await this.provedorAuth.atualizarMetadata(input.usuarioId, { associadoId: salvo.id })
    return salvo
  }
}
