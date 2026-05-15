import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CancelarCampanhaUseCase } from './CancelarCampanhaUseCase'
import { Campanha, Contribuicao, ICampanhaRepository, IContribuicaoRepository } from '@apa/core'
import { StatusCampanha, TipoContribuicao, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo: TipoLote.PRODUCAO, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const makeContribuicao = () =>
  new Contribuicao({ id: 'cont-1', campanhaId: 'c-1', associadoId: 'assoc-1', tipo: TipoContribuicao.DINHEIRO, valorMonetario: 100, liquidado: false, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
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

describe('CancelarCampanhaUseCase', () => {
  let useCase: CancelarCampanhaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CancelarCampanhaUseCase(campanhaRepo, contribuicaoRepo)
    campanhaRepo.update.mockImplementation(async c => c)
    contribuicaoRepo.findByCampanha.mockResolvedValue([])
  })

  it('cancela campanha PLANEJADA sem contribuições', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.PLANEJADA))
    const result = await useCase.execute('c-1')
    expect(result.status).toBe(StatusCampanha.CANCELADA)
    expect(campanhaRepo.update).toHaveBeenCalledTimes(1)
  })

  it('cancela campanha ATIVA sem contribuições', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    const result = await useCase.execute('c-1')
    expect(result.status).toBe(StatusCampanha.CANCELADA)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('c-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha está LIQUIDADA (RN26)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.LIQUIDADA))
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se campanha possui contribuições', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA))
    contribuicaoRepo.findByCampanha.mockResolvedValue([makeContribuicao()])
    await expect(useCase.execute('c-1')).rejects.toThrow(BadRequestException)
  })
})
