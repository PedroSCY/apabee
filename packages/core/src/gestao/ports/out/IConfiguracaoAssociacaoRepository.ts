import { ConfiguracaoAssociacao } from '../../entities/ConfiguracaoAssociacao';

/** Repositório singleton da configuração da associação. */
export interface IConfiguracaoAssociacaoRepository {
  findOne(): Promise<ConfiguracaoAssociacao | null>;
  save(config: ConfiguracaoAssociacao): Promise<ConfiguracaoAssociacao>;
  update(config: ConfiguracaoAssociacao): Promise<ConfiguracaoAssociacao>;
}
