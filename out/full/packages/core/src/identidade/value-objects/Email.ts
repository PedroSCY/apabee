import { DomainError } from '../../shared/DomainError'
import { ValueObject } from '../../shared/ValueObject'

interface EmailProps {
  value: string
}

/** Value Object que representa um email válido. Normalizado para lowercase e validado no formato. */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props)
  }

  /** Cria um Email validando e normalizando o valor. @throws DomainError se o formato for inválido. */
  static create(value: string): Email {
    const normalized = value.trim().toLowerCase()
    if (!Email.isValid(normalized)) {
      throw new DomainError(`Email inválido: ${value}`)
    }
    return new Email({ value: normalized })
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  get value(): string {
    return this.props.value
  }
}
