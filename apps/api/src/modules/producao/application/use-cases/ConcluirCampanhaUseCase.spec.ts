import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { ConcluirCampanhaUseCase } from './ConcluirCampanhaUseCase'
import { Campanha, ICampanhaRepository, IOrdemProducaoRepository, OrdemProducao } from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const makeOrdem = (status: StatusOrdemProducao) =>
  new OrdemProducao({ id: 'op-1', campanhaId: 'c-1', produtoId: 'p-1', quantidade: 10, status, perdaPercentual: 0, materiaisConsumidos: [], criadoEm: new Date() })

const repo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

const ordemRepo: jest.Mocked<IOrdemProducaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('ConcluirCampanhaUseCase', () => {
  let useCase: ConcluirCampanhaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new ConcluirCampanhaUseCase(repo, ordemRepo)
    repo.update.mockImplementation(async c => c)
    ordemRepo.findByCampanha.mockResolvedValue([])
  })

  it('transita ATIVA → CONCLUIDA', async () => {
    repo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    const result = await useCase.execute('c-1')
    expect(result.status).toBe(StatusCampanha.CONCLUIDA)
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(useCase.execute('c-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está ATIVA', async () => {
    repo.findById.mockResolvedValue(makeCampanha(StatusCampanha.PLANEJADA))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })

  it('lança ConflictException se existem ordens RASCUNHO', async () => {
    repo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    ordemRepo.findByCampanha.mockResolvedValue([makeOrdem(StatusOrdemProducao.RASCUNHO)])
    await expect(useCase.execute('c-1')).rejects.toThrow(ConflictException)
  })
})
