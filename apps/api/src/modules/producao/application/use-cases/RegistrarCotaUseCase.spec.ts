import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RegistrarCotaUseCase } from './RegistrarCotaUseCase'
import { Campanha, ICampanhaRepository, ICotaRepository } from '@apa/core'
import { StatusCampanha, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha, tipo = TipoLote.AQUISICAO, valorMinimo?: number, valorMaximo?: number) =>
  new Campanha({ id: 'c-1', codigo: 'AQUI-2025-001', nome: 'Aquisição', tipo, dataInicio: new Date(), status, valorMeta: 5000, valorMinimo, valorMaximo, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
const cotaRepo: jest.Mocked<ICotaRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  findByAssociado: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('RegistrarCotaUseCase', () => {
  let useCase: RegistrarCotaUseCase

  const input = { campanhaId: 'c-1', associadoId: 'assoc-1', valor: 500 }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new RegistrarCotaUseCase(campanhaRepo, cotaRepo)
    cotaRepo.save.mockImplementation(async c => c)
  })

  it('registra cota em campanha AQUISICAO ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    const result = await useCase.execute(input)
    expect(result.valor).toBe(500)
    expect(result.pago).toBe(false)
    expect(cotaRepo.save).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha é PRODUCAO', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.PRODUCAO))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se campanha não está ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.PLANEJADA))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se valor <= 0', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    await expect(useCase.execute({ ...input, valor: 0 })).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se valor abaixo do mínimo', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.AQUISICAO, 200))
    await expect(useCase.execute({ ...input, valor: 100 })).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se valor acima do máximo', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.AQUISICAO, undefined, 400))
    await expect(useCase.execute({ ...input, valor: 500 })).rejects.toThrow(BadRequestException)
  })
})
