import { NotFoundException } from '@nestjs/common'
import { PublicarAtaUseCase } from './PublicarAtaUseCase'
import { IAtaRepository, Ata } from '@apa/core'

const mockRepo: jest.Mocked<IAtaRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findPublicadas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

function makeAta(publicada = false): Ata {
  return new Ata({
    id: 'ata-1',
    titulo: 'Reunião',
    conteudo: 'Conteúdo',
    autorId: 'user-1',
    dataReuniao: new Date(),
    publicada,
    criadoEm: new Date(),
  })
}

describe('PublicarAtaUseCase', () => {
  let useCase: PublicarAtaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new PublicarAtaUseCase(mockRepo)
  })

  it('publica ata existente', async () => {
    const ata = makeAta(false)
    mockRepo.findById.mockResolvedValue(ata)
    mockRepo.update.mockImplementation(async (a) => a)

    const result = await useCase.execute('ata-1')

    expect(result.publicada).toBe(true)
    expect(mockRepo.update).toHaveBeenCalledTimes(1)
  })

  it('lança NotFoundException quando ata não existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('ata-x')).rejects.toThrow(NotFoundException)
  })
})
