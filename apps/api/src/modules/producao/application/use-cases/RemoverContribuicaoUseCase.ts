import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  ICampanhaRepository,
  IColheitaRepository,
  IContribuicaoRepository,
  IEstoqueCampanhaRepository,
  IEstoqueMateriaPrimaRepository,
  IRemoverContribuicaoUseCase,
} from '@apa/core'
import { StatusCampanha, TipoContribuicao } from '@apa/shared'
import {
  CAMPANHA_REPOSITORY,
  COLHEITA_REPOSITORY,
  CONTRIBUICAO_REPOSITORY,
  ESTOQUE_CAMPANHA_REPOSITORY,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
} from '../../producao.tokens'

@Injectable()
export class RemoverContribuicaoUseCase implements IRemoverContribuicaoUseCase {
  constructor(
    @Inject(CONTRIBUICAO_REPOSITORY)
    private readonly contribuicaoRepo: IContribuicaoRepository,
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(ESTOQUE_CAMPANHA_REPOSITORY)
    private readonly estoqueCampanhaRepo: IEstoqueCampanhaRepository,
    @Inject(ESTOQUE_MATERIA_PRIMA_REPOSITORY)
    private readonly poolRepo: IEstoqueMateriaPrimaRepository,
    @Inject(COLHEITA_REPOSITORY)
    private readonly colheitaRepo: IColheitaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const contribuicao = await this.contribuicaoRepo.findById(id)
    if (!contribuicao) throw new NotFoundException('Contribuição não encontrada')

    const campanha = await this.campanhaRepo.findById(contribuicao.campanhaId)
    if (campanha && campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Contribuições só podem ser removidas de campanhas ATIVAS')

    // Reverte EstoqueCampanha para contribuições COLHEITA
    if (
      contribuicao.tipo === TipoContribuicao.COLHEITA &&
      contribuicao.volume &&
      contribuicao.tipoMateriaPrimaId
    ) {
      const estoque = await this.estoqueCampanhaRepo.findByCampanhaETipo(
        contribuicao.campanhaId,
        contribuicao.tipoMateriaPrimaId,
      )
      if (estoque) {
        // Devolve apenas o que ainda está disponível (pode ter sido consumido por ordens)
        const aDevolver = Math.min(contribuicao.volume, estoque.quantidadeDisponivel)
        if (aDevolver > 0) {
          await this.estoqueCampanhaRepo.update(estoque.saida(aDevolver))

          // Contribuição da associação (pool): devolve também ao pool
          if (contribuicao.associadoId === null) {
            const pool = await this.poolRepo.findByTipo(contribuicao.tipoMateriaPrimaId)
            if (pool) {
              await this.poolRepo.update(pool.entrada(aDevolver))
            }
          }
        }
      }
    }

    await this.contribuicaoRepo.delete(id)

    // Remove a colheita vinculada (criada junto com a contribuição via CriarColheitaUseCase)
    if (contribuicao.colheitaId) {
      await this.colheitaRepo.delete(contribuicao.colheitaId)
    }
  }
}
