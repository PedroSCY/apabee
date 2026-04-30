export class DomainError extends Error {
  constructor(menssagem: string) {
    super(menssagem)
    this.name = "DomainError"
  }
}