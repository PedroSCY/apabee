/** Erro de violação de regra de negócio no domínio. Diferente de erros técnicos (HTTP, banco), este erro representa uma regra que foi descumprida. */
export class DomainError extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'DomainError'
  }
}