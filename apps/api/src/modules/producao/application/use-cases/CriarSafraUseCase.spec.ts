import { CriarSafraUseCase } from './CriarSafraUseCase'
import { ISafraRepository } from '@apa/core'
import { StatusSafra } from '@apa/shared'

const repo: jest.Mocked<ISafraRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

describe('CriarSafraUseCase', () => {
  let useCase: CriarSafraUseCase

  const input = {
    nome: 'Safra Laranjeira 2025',
    floradaId: 'florada-uuid-laranjeira',
    dataInicio: new Date('2025-09-01'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarSafraUseCase(repo)
    repo.save.mockImplementation(async s => s)
  })

  it('cria safra com status PLANEJADA', async () => {
    const result = await useCase.execute(input)
    expect(result.status).toBe(StatusSafra.PLANEJADA)
    expect(result.nome).toBe('Safra Laranjeira 2025')
    expect(result.floradaId).toBe('florada-uuid-laranjeira')
    expect(repo.save).toHaveBeenCalledTimes(1)
  })

  it('aplica trim no nome', async () => {
    const result = await useCase.execute({ ...input, nome: '  Safra 2025  ' })
    expect(result.nome).toBe('Safra 2025')
  })
})
