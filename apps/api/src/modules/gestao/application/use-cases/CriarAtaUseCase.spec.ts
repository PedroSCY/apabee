import { CriarAtaUseCase } from './CriarAtaUseCase'
import { IAtaRepository, IParticipanteAtaRepository, Ata } from '@apa/core'

const mockRepo: jest.Mocked<IAtaRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findPublicadas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

const mockParticipanteRepo: jest.Mocked<IParticipanteAtaRepository> = {
  findByAta: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('CriarAtaUseCase', () => {
  let useCase: CriarAtaUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarAtaUseCase(mockRepo, mockParticipanteRepo)
  })

  it('cria e salva uma nova ata não publicada por padrão', async () => {
    const input = {
      titulo: 'Reunião Ordinária',
      conteudo: 'Pauta: ...',
      autorId: 'user-1',
      dataReuniao: new Date('2026-05-01'),
    }
    mockRepo.save.mockImplementation(async (ata) => ata)

    const result = await useCase.execute(input)

    expect(result).toBeInstanceOf(Ata)
    expect(result.titulo).toBe('Reunião Ordinária')
    expect(result.publicada).toBe(false)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
  })

  it('cria ata já publicada quando publicada=true', async () => {
    mockRepo.save.mockImplementation(async (ata) => ata)

    const result = await useCase.execute({
      titulo: 'Reunião Extraordinária',
      conteudo: 'Pauta urgente',
      autorId: 'user-1',
      dataReuniao: new Date(),
      publicada: true,
    })

    expect(result.publicada).toBe(true)
  })
})
