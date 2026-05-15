import { BadRequestException, NotFoundException } from '@nestjs/common'
import { EncerrarSafraUseCase } from './EncerrarSafraUseCase'
import { ISafraRepository, Safra } from '@apa/core'
import { StatusSafra } from '@apa/shared'

const makeSafra = (status: StatusSafra) =>
  new Safra({ id: 'safra-1', nome: 'Teste', floradaId: 'florada-uuid', dataInicio: new Date(), status })

const repo: jest.Mocked<ISafraRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

describe('EncerrarSafraUseCase', () => {
  let useCase: EncerrarSafraUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new EncerrarSafraUseCase(repo)
    repo.update.mockImplementation(async s => s)
  })

  it('transita EM_ANDAMENTO → ENCERRADA', async () => {
    repo.findById.mockResolvedValue(makeSafra(StatusSafra.EM_ANDAMENTO))
    const result = await useCase.execute('safra-1')
    expect(result.status).toBe(StatusSafra.ENCERRADA)
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se safra não existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(useCase.execute('safra-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se safra não está EM_ANDAMENTO', async () => {
    repo.findById.mockResolvedValue(makeSafra(StatusSafra.PLANEJADA))
    await expect(useCase.execute('safra-1')).rejects.toThrow(BadRequestException)
  })
})
