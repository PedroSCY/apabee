/** Classe base para Value Objects. Imutáveis e comparados por valor (não por identidade). */
export abstract class ValueObject<T> {
  protected readonly props: T

  constructor(props: T){
    this.props = Object.freeze(props)
  }

  /** Compara dois Value Objects pelo valor (serialização JSON dos props). */
  equals(other: ValueObject<T>): boolean {
    if (!(other instanceof ValueObject)) return false
    return JSON.stringify(this.props) === JSON.stringify(other.props)
  }
}