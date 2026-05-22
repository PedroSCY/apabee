import { BadRequestException, NotFoundException } from '@nestjs/common'
import { IniciarSafraUseCase } from './IniciarSafraUseCase'
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
  delete: jest.fn(),
}

describe('IniciarSafraUseCase', () => {
  let useCase: IniciarSafraUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new IniciarSafraUseCase(repo)
    repo.update.mockImplementation(async s => s)
  })

  it('transita PLANEJADA → EM_ANDAMENTO', async () => {
    repo.findById.mockResolvedValue(makeSafra(StatusSafra.PLANEJADA))
    const result = await useCase.execute('safra-1')
    expect(result.status).toBe(StatusSafra.EM_ANDAMENTO)
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException se safra não existe', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(useCase.execute('safra-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se safra não está PLANEJADA', async () => {
    repo.findById.mockResolvedValue(makeSafra(StatusSafra.EM_ANDAMENTO))
    await expect(useCase.execute('safra-1')).rejects.toThrow(BadRequestException)
  })
})
