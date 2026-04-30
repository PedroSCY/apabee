import { ConfiguracaoAssociacao } from '../../entities/ConfiguracaoAssociacao';

// Singleton — findOne busca o único registro existente
export interface IConfiguracaoAssociacaoRepository {
  findOne(): Promise<ConfiguracaoAssociacao | null>;
  save(config: ConfiguracaoAssociacao): Promise<ConfiguracaoAssociacao>;
  update(config: ConfiguracaoAssociacao): Promise<ConfiguracaoAssociacao>;
}
