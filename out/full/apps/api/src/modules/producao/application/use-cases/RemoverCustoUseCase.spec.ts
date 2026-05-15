import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RemoverCustoUseCase } from './RemoverCustoUseCase'
import { Campanha, CustoCampanha, ICampanhaRepository, ICustoCampanhaRepository } from '@apa/core'
import { CategoriaCusto, StatusCampanha, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const makeCusto = () =>
  new CustoCampanha({ id: 'custo-1', campanhaId: 'c-1', descricao: 'Embalagens', valor: 100, categoria: CategoriaCusto.EMBALAGEM, criadoEm: new Date() })

const custoRepo: jest.Mocked<ICustoCampanhaRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
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

describe('RemoverCustoUseCase', () => {
  let useCase: RemoverCustoUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new RemoverCustoUseCase(custoRepo, campanhaRepo)
    custoRepo.delete.mockResolvedValue(undefined)
  })

  it('remove custo de campanha não liquidada', async () => {
    custoRepo.findById.mockResolvedValue(makeCusto())
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await useCase.execute('custo-1')
    expect(custoRepo.delete).toHaveBeenCalledWith('custo-1')
  })

  it('lança NotFoundException se custo não existe', async () => {
    custoRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('custo-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha está LIQUIDADA', async () => {
    custoRepo.findById.mockResolvedValue(makeCusto())
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.LIQUIDADA))
    await expect(useCase.execute('custo-1')).rejects.toThrow(BadRequestException)
  })
})
