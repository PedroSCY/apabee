import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RegistrarCustoUseCase } from './RegistrarCustoUseCase'
import { Campanha, ICampanhaRepository, ICustoCampanhaRepository } from '@apa/core'
import { CategoriaCusto, StatusCampanha, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
const custoRepo: jest.Mocked<ICustoCampanhaRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('RegistrarCustoUseCase', () => {
  let useCase: RegistrarCustoUseCase

  const input = { campanhaId: 'c-1', descricao: 'Embalagens', valor: 150, categoria: CategoriaCusto.EMBALAGEM }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new RegistrarCustoUseCase(campanhaRepo, custoRepo)
    custoRepo.save.mockImplementation(async c => c)
  })

  it('registra custo em campanha não liquidada', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    const result = await useCase.execute(input)
    expect(result.valor).toBe(150)
    expect(result.descricao).toBe('Embalagens')
    expect(custoRepo.save).toHaveBeenCalledTimes(1)
  })

  it('aplica trim na descricao', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    const result = await useCase.execute({ ...input, descricao: '  Embalagens  ' })
    expect(result.descricao).toBe('Embalagens')
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha está LIQUIDADA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.LIQUIDADA))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se valor <= 0', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await expect(useCase.execute({ ...input, valor: 0 })).rejects.toThrow(BadRequestException)
  })
})
