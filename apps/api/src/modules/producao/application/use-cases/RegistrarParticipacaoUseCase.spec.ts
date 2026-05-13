import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RegistrarParticipacaoUseCase } from './RegistrarParticipacaoUseCase'
import { ICalcularRateioUseCase, ILoteProducaoRepository, IParticipacaoLoteRepository, LoteProducao, ParticipacaoLote } from '@apa/core'
import { StatusLote, TipoLote } from '@apa/shared'

const makeLote = (status: StatusLote) =>
  new LoteProducao({ id: 'lote-1', tipo: TipoLote.PRODUCAO, periodo: '2025-01', dataInicio: new Date(), status, custoTotal: 0 })

const loteRepo: jest.Mocked<ILoteProducaoRepository> = {
  findById: jest.fn(),
  findAtivos: jest.fn(),
  findAll: jest.fn(),
  findAbertosVencidos: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

const participacaoRepo: jest.Mocked<IParticipacaoLoteRepository> = {
  findByLote: jest.fn(),
  findByAssociadoELote: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
}

const calcularRateio: jest.Mocked<ICalcularRateioUseCase> = {
  execute: jest.fn(),
}

const input = {
  loteProducaoId: 'lote-1',
  associadoId: 'assoc-1',
  percentual: 30,
  volume: 20,
}

describe('RegistrarParticipacaoUseCase', () => {
  let useCase: RegistrarParticipacaoUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    calcularRateio.execute.mockResolvedValue([])
    useCase = new RegistrarParticipacaoUseCase(loteRepo, participacaoRepo, calcularRateio)
  })

  it('registra participação em lote aberto e retorna resultado do rateio', async () => {
    const recalculada = new ParticipacaoLote({ id: 'p-1', loteProducaoId: 'lote-1', associadoId: 'assoc-1', percentual: 100, percentualManual: false, volume: 20 })
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    participacaoRepo.findByAssociadoELote.mockResolvedValue(null)
    participacaoRepo.save.mockImplementation(async (p) => p)
    calcularRateio.execute.mockResolvedValue([recalculada])

    const result = await useCase.execute(input)
    expect(result.associadoId).toBe('assoc-1')
    expect(result.percentual).toBe(100)
    expect(participacaoRepo.save).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se lote não existe', async () => {
    loteRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se lote encerrado', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.FECHADO))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se associado já tem participação', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    participacaoRepo.findByAssociadoELote.mockResolvedValue({} as any)
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })
})
