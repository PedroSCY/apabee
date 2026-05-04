import { CriarDocumentoUseCase } from './CriarDocumentoUseCase'
import { IDocumentoRepository, Documento } from '@apa/core'
import { CategoriaDocumento } from '@apa/shared'

const mockRepo: jest.Mocked<IDocumentoRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findPublicados: jest.fn(),
  findByCategoria: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('CriarDocumentoUseCase', () => {
  let useCase: CriarDocumentoUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarDocumentoUseCase(mockRepo)
  })

  it('cria e salva documento com publicado=false por padrão', async () => {
    mockRepo.save.mockImplementation(async (doc) => doc)

    const result = await useCase.execute({
      titulo: 'Ata Reunião Mai/26',
      categoria: CategoriaDocumento.ATA,
      arquivoUrl: 'https://storage.example.com/ata.pdf',
      tamanhoBytes: 102_400,
      autorId: 'user-1',
    })

    expect(result).toBeInstanceOf(Documento)
    expect(result.publicado).toBe(false)
    expect(result.categoria).toBe(CategoriaDocumento.ATA)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
  })

  it('cria documento público quando publicado=true', async () => {
    mockRepo.save.mockImplementation(async (doc) => doc)

    const result = await useCase.execute({
      titulo: 'Balanço 2026',
      categoria: CategoriaDocumento.FINANCEIRO,
      arquivoUrl: 'https://storage.example.com/balanco.pdf',
      tamanhoBytes: 51_200,
      autorId: 'user-1',
      publicado: true,
    })

    expect(result.publicado).toBe(true)
  })
})
