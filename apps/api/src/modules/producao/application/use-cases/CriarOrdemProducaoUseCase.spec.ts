import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CriarOrdemProducaoUseCase } from './CriarOrdemProducaoUseCase'
import { Campanha, ICampanhaRepository, IOrdemProducaoRepository } from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, TipoLote } from '@apa/shared'

const makeCampanha = (tipo: TipoLote, status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
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

describe('CriarOrdemProducaoUseCase', () => {
  let useCase: CriarOrdemProducaoUseCase

  const input = { campanhaId: 'c-1', produtoId: 'prod-1', quantidade: 50 }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarOrdemProducaoUseCase(campanhaRepo, ordemRepo)
    ordemRepo.save.mockImplementation(async o => o)
  })

  it('cria ordem com status PENDENTE', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    const result = await useCase.execute(input)
    expect(result.status).toBe(StatusOrdemProducao.PENDENTE)
    expect(result.quantidade).toBe(50)
    expect(result.perdaPercentual).toBe(0)
    expect(ordemRepo.save).toHaveBeenCalledTimes(1)
  })

  it('usa perdaPercentual fornecido', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    const result = await useCase.execute({ ...input, perdaPercentual: 5 })
    expect(result.perdaPercentual).toBe(5)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha é AQUISICAO', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.AQUISICAO, StatusCampanha.ATIVA))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se campanha não está ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.PLANEJADA))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se quantidade <= 0', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    await expect(useCase.execute({ ...input, quantidade: 0 })).rejects.toThrow(BadRequestException)
  })
})
