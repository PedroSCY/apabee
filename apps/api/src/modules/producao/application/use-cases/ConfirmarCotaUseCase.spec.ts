import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfirmarCotaUseCase } from './ConfirmarCotaUseCase'
import { Cota, ICotaRepository } from '@apa/core'

const makeCota = (pago: boolean) =>
  new Cota({ id: 'cota-1', campanhaId: 'c-1', associadoId: 'assoc-1', origem: 'ASSOCIADO' as any, valor: 300, data: new Date(), pago })

const repo: jest.Mocked<ICotaRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  findByAssociado: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('ConfirmarCotaUseCase', () => {
  let useCase: ConfirmarCotaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new ConfirmarCotaUseCase(repo)
    repo.update.mockImplementation(async c => c)
  })

  it('confirma cota não paga', async () => {
    repo.findById.mockResolvedValue(makeCota(false))
    const result = await useCase.execute('cota-1')
    expect(result.pago).toBe(true)
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se cota não existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(useCase.execute('cota-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se cota já está confirmada', async () => {
    repo.findById.mockResolvedValue(makeCota(true))
    await expect(useCase.execute('cota-1')).rejects.toThrow(BadRequestException)
  })
})
