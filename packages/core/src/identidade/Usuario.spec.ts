import { RoleUsuario } from "@repo/shared"
import { Usuario } from "./Usuario"
import { DomainError } from "../shared/DomainError"

const makeAdmin = (id?: string) =>
  Usuario.create({ nome: 'Admin APA', email: 'admin@apa.com.br', role: RoleUsuario.ADMIN }, id)

const makeAssociado = (id?: string) =>
  Usuario.create({ nome: 'João Silva', email: 'joao@apa.com.br', role: RoleUsuario.ASSOCIADO }, id)

describe('Usuario', () => {
  it('deve criar usuário com dados válidos', () => {
    const u = makeAssociado()
    expect(u.nome).toBe('João Silva')
    expect(u.email).toBe('joao@apa.com.br')
    expect(u.ativo).toBe(true)
  })

  it('deve lançar DomainError para nome vazio', () => {
    expect(() =>
      Usuario.create({ nome: '  ', email: 'joao@apa.com.br', role: RoleUsuario.ASSOCIADO }),
    ).toThrow(DomainError)
  })

  it('isAdmin deve retornar true para ADMIN', () => {
    expect(makeAdmin().isAdmin()).toBe(true)
  })

  it('isAssociado deve retornar true para ASSOCIADO', () => {
    expect(makeAssociado().isAssociado()).toBe(true)
  })

  it('deve desativar um associado', () => {
    const u = makeAssociado()
    u.desativar()
    expect(u.ativo).toBe(false)
  })

  it('não deve desativar um admin', () => {
    expect(() => makeAdmin().desativar()).toThrow(DomainError)
  })

  it('deve reativar um usuário desativado', () => {
    const u = makeAssociado()
    u.desativar()
    u.ativar()
    expect(u.ativo).toBe(true)
  })

  it('dois usuários com mesmo id devem ser iguais', () => {
    const id = 'same-id'
    expect(makeAssociado(id).equals(makeAssociado(id))).toBe(true)
  })

  it('dois usuários com ids diferentes não devem ser iguais', () => {
    expect(makeAssociado().equals(makeAssociado())).toBe(false)
  })
})
