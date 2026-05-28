import { BadRequestException, NotFoundException } from '@nestjs/common'
import { IniciarCampanhaUseCase } from './IniciarCampanhaUseCase'
import { Campanha, ICampanhaRepository, IMetaProducaoRepository, IOrdemProducaoRepository } from '@apa/core'
import { StatusCampanha, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const repo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

const metaRepo: jest.Mocked<IMetaProducaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  findByCampanhaEProduto: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

const ordemRepo: jest.Mocked<IOrdemProducaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  salvarConfirmacaoAtomico: jest.fn(),
}

describe('IniciarCampanhaUseCase', () => {
  let useCase: IniciarCampanhaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new IniciarCampanhaUseCase(repo, metaRepo, ordemRepo)
    repo.update.mockImplementation(async c => c)
  })

  it('transita PLANEJADA → ATIVA', async () => {
    repo.findById.mockResolvedValue(makeCampanha(StatusCampanha.PLANEJADA))
    const result = await useCase.execute('c-1')
    expect(result.status).toBe(StatusCampanha.ATIVA)
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(useCase.execute('c-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está PLANEJADA', async () => {
    repo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })
})
