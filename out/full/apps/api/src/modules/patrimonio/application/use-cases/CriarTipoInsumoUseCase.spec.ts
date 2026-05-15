import { ConflictException } from '@nestjs/common'
import { CategoriaInsumo } from '@apa/shared'
import { ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { CriarTipoInsumoUseCase } from './CriarTipoInsumoUseCase'

const makeTipoInsumo = (overrides: Partial<ConstructorParameters<typeof TipoInsumo>[0]> = {}): TipoInsumo =>
  new TipoInsumo({
    id: 'tipo-1',
    nome: 'Fumigador',
    categoria: CategoriaInsumo.FERRAMENTA,
    sigla: 'FUM',
    criadoEm: new Date(),
    ...overrides,
  })

const makeRepo = (): jest.Mocked<ITipoInsumoRepository> => ({
  findById: jest.fn(),
  findBySigla: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('CriarTipoInsumoUseCase', () => {
  let useCase: CriarTipoInsumoUseCase
  let repo: jest.Mocked<ITipoInsumoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new CriarTipoInsumoUseCase(repo)
  })

  it('cria tipo com sigla normalizada para maiúsculas', async () => {
    repo.findBySigla.mockResolvedValue(null)
    repo.save.mockImplementation(async (t) => t)

    const result = await useCase.execute({
      nome: 'Fumigador',
      categoria: CategoriaInsumo.FERRAMENTA,
      sigla: 'fum',
    })

    expect(result.sigla).toBe('FUM')
    expect(repo.findBySigla).toHaveBeenCalledWith('FUM')
  })

  it('faz trim no nome antes de salvar', async () => {
    repo.findBySigla.mockResolvedValue(null)
    repo.save.mockImplementation(async (t) => t)

    const result = await useCase.execute({
      nome: '  Fumigador  ',
      categoria: CategoriaInsumo.FERRAMENTA,
      sigla: 'FUM',
    })

    expect(result.nome).toBe('Fumigador')
  })

  it('persiste descricao quando fornecida', async () => {
    repo.findBySigla.mockResolvedValue(null)
    repo.save.mockImplementation(async (t) => t)

    const result = await useCase.execute({
      nome: 'Fumigador',
      categoria: CategoriaInsumo.FERRAMENTA,
      sigla: 'FUM',
      descricao: '  Modelo metálico  ',
    })

    expect(result.descricao).toBe('Modelo metálico')
  })

  it('lança ConflictException quando sigla já existe', async () => {
    repo.findBySigla.mockResolvedValue(makeTipoInsumo())

    await expect(
      useCase.execute({ nome: 'Outro', categoria: CategoriaInsumo.FERRAMENTA, sigla: 'FUM' }),
    ).rejects.toThrow(ConflictException)

    expect(repo.save).not.toHaveBeenCalled()
  })

  it('salva no repositório e retorna o resultado', async () => {
    const saved = makeTipoInsumo()
    repo.findBySigla.mockResolvedValue(null)
    repo.save.mockResolvedValue(saved)

    const result = await useCase.execute({
      nome: 'Fumigador',
      categoria: CategoriaInsumo.FERRAMENTA,
      sigla: 'FUM',
    })

    expect(repo.save).toHaveBeenCalledTimes(1)
    expect(result).toBe(saved)
  })
})
