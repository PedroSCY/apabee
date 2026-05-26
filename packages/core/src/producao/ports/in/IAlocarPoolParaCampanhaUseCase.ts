export interface AlocarPoolParaCampanhaInput {
  campanhaId: string
  tipoMateriaPrimaId: string
  quantidade: number
  /** Valor monetário (R$) da alocação — necessário para registrar como contribuição da associação. */
  valorMonetario: number
}

export interface IAlocarPoolParaCampanhaUseCase {
  execute(input: AlocarPoolParaCampanhaInput): Promise<void>
}
