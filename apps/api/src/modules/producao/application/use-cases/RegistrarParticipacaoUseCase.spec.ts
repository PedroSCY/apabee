import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RegistrarParticipacaoUseCase } from './RegistrarParticipacaoUseCase'
import { ILoteProducaoRepository, IParticipacaoLoteRepository, LoteProducao } from '@apa/core'
import { StatusLote, TipoLote } from '@apa/shared'

const makeLote = (status: StatusLote) =>
  new LoteProducao({ id: 'lote-1', tipo: TipoLote.PRODUCAO, periodo: '2025-01', dataInicio: new Date(), status, custoTotal: 0 })

const loteRepo: jest.Mocked<ILoteProducaoRepository> = {
  findById: jest.fn(),
  findAtivos: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

const participacaoRepo: jest.Mocked<IParticipacaoLoteRepository> = {
  findByLote: jest.fn(),
  findByAssociadoELote: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
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
    useCase = new RegistrarParticipacaoUseCase(loteRepo, participacaoRepo)
  })

  it('registra participação em lote aberto', async () => {
    loteRepo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    participacaoRepo.findByAssociadoELote.mockResolvedValue(null)
    participacaoRepo.save.mockImplementation(async (p) => p)

    const result = await useCase.execute(input)
    expect(result.associadoId).toBe('assoc-1')
    expect(result.percentual).toBe(30)
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
