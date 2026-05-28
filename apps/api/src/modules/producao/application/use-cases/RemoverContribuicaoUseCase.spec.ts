import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RemoverContribuicaoUseCase } from './RemoverContribuicaoUseCase'
import { Campanha, Contribuicao, ICampanhaRepository, IColheitaRepository, IContribuicaoRepository, IEstoqueCampanhaRepository, IEstoqueMateriaPrimaRepository } from '@apa/core'
import { StatusCampanha, TipoContribuicao, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const makeContribuicao = () =>
  new Contribuicao({ id: 'cont-1', campanhaId: 'c-1', associadoId: 'assoc-1', tipo: TipoContribuicao.DINHEIRO, valorMonetario: 100, liquidado: false, criadoEm: new Date() })

const contribuicaoRepo: jest.Mocked<IContribuicaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  findByAssociado: jest.fn(),
  findByCampanhaEAssociado: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

const estoqueCampanhaRepo: jest.Mocked<IEstoqueCampanhaRepository> = {
  findByCampanha: jest.fn(),
  findByCampanhaETipo: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  salvarMovimentacao: jest.fn(),
  countSaidas: jest.fn(),
  findMovimentacoes: jest.fn(),
}

const poolRepo: jest.Mocked<IEstoqueMateriaPrimaRepository> = {
  findAll: jest.fn(),
  findByTipo: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  salvarMovimentacao: jest.fn(),
  findMovimentacoesByEstoque: jest.fn(),
  deleteByTipo: jest.fn(),
}

const colheitaRepo: jest.Mocked<IColheitaRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByAssociado: jest.fn(),
  findByCampanha: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('RemoverContribuicaoUseCase', () => {
  let useCase: RemoverContribuicaoUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new RemoverContribuicaoUseCase(contribuicaoRepo, campanhaRepo, estoqueCampanhaRepo, poolRepo, colheitaRepo)
    contribuicaoRepo.delete.mockResolvedValue(undefined)
  })

  it('remove contribuição de campanha ATIVA', async () => {
    contribuicaoRepo.findById.mockResolvedValue(makeContribuicao())
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await useCase.execute('cont-1')
    expect(contribuicaoRepo.delete).toHaveBeenCalledWith('cont-1')
  })

  it('lança NotFoundException se contribuição não existe', async () => {
    contribuicaoRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('cont-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está ATIVA', async () => {
    contribuicaoRepo.findById.mockResolvedValue(makeContribuicao())
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.CONCLUIDA))
    await expect(useCase.execute('cont-1')).rejects.toThrow(BadRequestException)
  })
})
