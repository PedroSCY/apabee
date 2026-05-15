import { ConflictException, Inject, Injectable } from '@nestjs/common'
import {
  CriarUsuarioInput,
  ICriarUsuarioUseCase,
  IProvedorAuth,
  IUsuarioRepository,
  Usuario,
} from '@apa/core'
import { PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Cria um usuário no banco e a credencial no Supabase Auth */
export class CriarUsuarioUseCase implements ICriarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a criação do usuário com validação de e-mail duplicado */
  async execute(input: CriarUsuarioInput): Promise<Usuario> {
    const email = input.email.toLowerCase().trim()

    const existing = await this.usuarioRepository.findByEmail(email)
    if (existing) throw new ConflictException('E-mail já cadastrado')

    const { id } = await this.provedorAuth.criarCredencial({
      email,
      role: input.role,
      nome: input.nome,
      telefone: input.telefone,
      senha: input.senha,
    })

    const usuario = new Usuario({
      id,
      nome: input.nome,
      email,
      role: input.role,
      ativo: true,
      criadoEm: new Date(),
    })

    return this.usuarioRepository.save(usuario)
  }
}
