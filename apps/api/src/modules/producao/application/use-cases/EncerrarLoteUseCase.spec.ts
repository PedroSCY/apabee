import { BadRequestException, NotFoundException } from '@nestjs/common'
import { EncerrarLoteUseCase } from './EncerrarLoteUseCase'
import { ILoteProducaoRepository, LoteProducao } from '@apa/core'
import { StatusLote, TipoLote } from '@apa/shared'

const makeLote = (status: StatusLote) =>
  new LoteProducao({ id: 'lote-1', tipo: TipoLote.PRODUCAO, periodo: '2025-01', dataInicio: new Date(), status, custoTotal: 0 })

const repo: jest.Mocked<ILoteProducaoRepository> = {
  findById: jest.fn(),
  findAtivos: jest.fn(),
  findAll: jest.fn(),
  findAbertosVencidos: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

describe('EncerrarLoteUseCase', () => {
  let useCase: EncerrarLoteUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new EncerrarLoteUseCase(repo)
  })

  it('encerra lote aberto', async () => {
    repo.findById.mockResolvedValue(makeLote(StatusLote.ABERTO))
    repo.update.mockImplementation(async (l) => l)

    const result = await useCase.execute('lote-1')
    expect(result.status).toBe(StatusLote.FECHADO)
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se lote não existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(useCase.execute('lote-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se lote já fechado', async () => {
    repo.findById.mockResolvedValue(makeLote(StatusLote.FECHADO))
    await expect(useCase.execute('lote-1')).rejects.toThrow(BadRequestException)
  })
})
