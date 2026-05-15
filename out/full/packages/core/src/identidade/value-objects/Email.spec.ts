import { DomainError } from "../../shared/DomainError"
import { Email } from "./Email"

describe('Email', () => {
  it('deve criar um email válido', () => {
    const email = Email.create('joao@apa.com.br')
    expect(email.value).toBe('joao@apa.com.br')
  })

  it('deve normalizar email para minúsculas', () => {
    const email = Email.create('JOAO@APA.COM.BR')
    expect(email.value).toBe('joao@apa.com.br')
  })

  it('deve lançar DomainError para email inválido', () => {
    expect(() => Email.create('nao-e-email')).toThrow(DomainError)
  })

  it('deve lançar DomainError para email vazio', () => {
    expect(() => Email.create('')).toThrow(DomainError)
  })

  it('dois emails iguais devem ser iguais', () => {
    const a = Email.create('joao@apa.com.br')
    const b = Email.create('joao@apa.com.br')
    expect(a.equals(b)).toBe(true)
  })

  it('dois emails diferentes não devem ser iguais', () => {
    const a = Email.create('joao@apa.com.br')
    const b = Email.create('maria@apa.com.br')
    expect(a.equals(b)).toBe(false)
  })
})
