export interface IStoragePort {
  obterUrlAssinada(caminho: string, expiracaoSegundos?: number): Promise<string>
  excluir(caminho: string): Promise<void>
}
