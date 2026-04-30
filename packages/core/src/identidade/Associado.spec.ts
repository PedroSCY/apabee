import { RoleUsuario } from "@repo/shared"
import { Usuario } from "./Usuario"
import { Associado } from "./Associado"
import { DomainError } from "../shared/DomainError"

const makeUsuarioAssociado = () =>
  Usuario.create({ nome: 'João Silva', email: 'joao@apa.com.br', role: RoleUsuario.ASSOCIADO })

const makeUsuarioAdmin = () =>
  Usuario.create({ nome: 'Admin', email: 'admin@apa.com.br', role: RoleUsuario.ADMIN })

describe('Associado', () => {
  it('deve criar associado com usuário de role ASSOCIADO', () => {
    const a = Associado.create({ usuario: makeUsuarioAssociado() })
    expect(a.nome).toBe('João Silva')
    expect(a.estaAtivo()).toBe(true)
  })

  it('não deve criar associado com role ADMIN', () => {
    expect(() => Associado.create({ usuario: makeUsuarioAdmin() })).toThrow(DomainError)
  })

  it('deve registrar data de ingresso padrão como hoje', () => {
    const a = Associado.create({ usuario: makeUsuarioAssociado() })
    expect(a.dataIngresso).toBeInstanceOf(Date)
  })

  it('deve atualizar observações', () => {
    const a = Associado.create({ usuario: makeUsuarioAssociado() })
    a.atualizarObservacoes('Apicultor experiente')
    expect(a.observacoes).toBe('Apicultor experiente')
  })

  it('deve refletir estado ativo do usuário vinculado', () => {
    const u = makeUsuarioAssociado()
    const a = Associado.create({ usuario: u })
    u.desativar()
    expect(a.estaAtivo()).toBe(false)
  })
})
