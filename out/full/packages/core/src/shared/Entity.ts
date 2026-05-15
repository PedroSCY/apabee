/** Classe base para todas as entidades de domínio. Provê identidade (id UUID) e comparação por identidade. */
export abstract class Entity<T> {
  protected readonly _id: string
  protected props: T

  /** @param props - Dados da entidade. @param id - UUID opcional (gerado automaticamente se omitido). */
  constructor(props: T, id?: string) {
    this._id = id ?? crypto.randomUUID()
    this.props = props
  }

  /** Identificador único da entidade. */
  get id(): string {
    return this._id
  }

  /** Compara duas entidades pela identidade (id), não por valor. */
  equals(other: Entity<T>): boolean {
    if (!(other instanceof Entity)) return false
    return this._id === other._id
  }
}
