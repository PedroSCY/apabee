import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { IInsumoRepository, Insumo } from '@apa/core'
import { CriarInsumoUseCase } from './CriarInsumoUseCase'

const makeInsumo = (overrides = {}): Insumo =>
  new Insumo({
    id: 'ins-uuid-1',
    nome: 'Fumigador',
    categoria: CategoriaInsumo.FERRAMENTA,
    status: StatusPatrimonio.DISPONIVEL,
    criadoEm: new Date(),
    ...overrides,
  })

const makeRepo = (): jest.Mocked<IInsumoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

describe('CriarInsumoUseCase', () => {
  let useCase: CriarInsumoUseCase
  let repo: jest.Mocked<IInsumoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new CriarInsumoUseCase(repo)
  })

  it('cria insumo com status DISPONIVEL', async () => {
    const saved = makeInsumo()
    repo.save.mockResolvedValue(saved)

    const result = await useCase.execute({ nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA })

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusPatrimonio.DISPONIVEL }),
    )
    expect(result).toBe(saved)
  })

  it('trim no nome antes de salvar', async () => {
    repo.save.mockImplementation(async (i) => i)

    const result = await useCase.execute({ nome: '  Fumigador  ', categoria: CategoriaInsumo.FERRAMENTA })

    expect(result.nome).toBe('Fumigador')
  })

  it('persiste categoria corretamente', async () => {
    repo.save.mockImplementation(async (i) => i)

    const result = await useCase.execute({ nome: 'Véu', categoria: CategoriaInsumo.INSUMO })

    expect(result.categoria).toBe(CategoriaInsumo.INSUMO)
  })
})
