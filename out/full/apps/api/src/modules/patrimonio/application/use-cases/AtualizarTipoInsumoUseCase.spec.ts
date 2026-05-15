import { NotFoundException } from '@nestjs/common'
import { CategoriaInsumo } from '@apa/shared'
import { ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { AtualizarTipoInsumoUseCase } from './AtualizarTipoInsumoUseCase'

const makeTipoInsumo = (): TipoInsumo =>
  new TipoInsumo({
    id: 'tipo-1',
    nome: 'Fumigador',
    categoria: CategoriaInsumo.FERRAMENTA,
    sigla: 'FUM',
    criadoEm: new Date(),
  })

const makeRepo = (): jest.Mocked<ITipoInsumoRepository> => ({
  findById: jest.fn(),
  findBySigla: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('AtualizarTipoInsumoUseCase', () => {
  let useCase: AtualizarTipoInsumoUseCase
  let repo: jest.Mocked<ITipoInsumoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new AtualizarTipoInsumoUseCase(repo)
  })

  it('atualiza nome e sigla quando fornecidos', async () => {
    repo.findById.mockResolvedValue(makeTipoInsumo())
    repo.update.mockImplementation(async (t) => t)

    const result = await useCase.execute('tipo-1', { nome: 'Fumigador Pro', sigla: 'FPR' })

    expect(result.nome).toBe('Fumigador Pro')
    expect(result.sigla).toBe('FPR')
    expect(repo.update).toHaveBeenCalledTimes(1)
  })

  it('atualização parcial não altera campos omitidos', async () => {
    repo.findById.mockResolvedValue(makeTipoInsumo())
    repo.update.mockImplementation(async (t) => t)

    const result = await useCase.execute('tipo-1', { nome: 'Fumigador Pro' })

    expect(result.sigla).toBe('FUM')
  })

  it('lança NotFoundException quando tipo não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(
      useCase.execute('nao-existe', { nome: 'X' }),
    ).rejects.toThrow(NotFoundException)

    expect(repo.update).not.toHaveBeenCalled()
  })
})
