import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { IInsumoRepository, ITipoInsumoRepository, TipoInsumo } from '@apa/core'
import { AdicionarUnidadesInsumoUseCase } from './AdicionarUnidadesInsumoUseCase'

const makeTipoInsumo = (sigla = 'FUM'): TipoInsumo =>
  new TipoInsumo({ id: 'tipo-1', nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA, sigla, criadoEm: new Date() })

const makeTipoRepo = (): jest.Mocked<ITipoInsumoRepository> => ({
  findById: jest.fn(),
  findBySigla: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

const makeInsumoRepo = (): jest.Mocked<IInsumoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findAvailableByTipo: jest.fn(),
  maxSequenceByTipo: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('AdicionarUnidadesInsumoUseCase', () => {
  let useCase: AdicionarUnidadesInsumoUseCase
  let tipoRepo: jest.Mocked<ITipoInsumoRepository>
  let insumoRepo: jest.Mocked<IInsumoRepository>

  beforeEach(() => {
    tipoRepo = makeTipoRepo()
    insumoRepo = makeInsumoRepo()
    useCase = new AdicionarUnidadesInsumoUseCase(tipoRepo, insumoRepo)
  })

  it('cria unidades com identificadores sequenciais a partir de zero', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.maxSequenceByTipo.mockResolvedValue(0)
    insumoRepo.saveMany.mockImplementation(async (arr) => arr)

    const result = await useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 3 })

    expect(result).toHaveLength(3)
    expect(result[0]!.identificador).toBe('FUM-001')
    expect(result[1]!.identificador).toBe('FUM-002')
    expect(result[2]!.identificador).toBe('FUM-003')
  })

  it('continua a partir do max existente (não reinicia após exclusão)', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    // Havia 3 unidades, 1 foi excluída — maxSequence = 3 (não 2)
    insumoRepo.maxSequenceByTipo.mockResolvedValue(3)
    insumoRepo.saveMany.mockImplementation(async (arr) => arr)

    const result = await useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 2 })

    expect(result[0]!.identificador).toBe('FUM-004')
    expect(result[1]!.identificador).toBe('FUM-005')
  })

  it('formata número com zero à esquerda (3 dígitos)', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.maxSequenceByTipo.mockResolvedValue(9)
    insumoRepo.saveMany.mockImplementation(async (arr) => arr)

    const result = await useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 1 })

    expect(result[0]!.identificador).toBe('FUM-010')
  })

  it('usa a sigla do tipo no identificador', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo('COL'))
    insumoRepo.maxSequenceByTipo.mockResolvedValue(0)
    insumoRepo.saveMany.mockImplementation(async (arr) => arr)

    const result = await useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 1 })

    expect(result[0]!.identificador).toMatch(/^COL-/)
  })

  it('cria unidades com status DISPONIVEL', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.maxSequenceByTipo.mockResolvedValue(0)
    insumoRepo.saveMany.mockImplementation(async (arr) => arr)

    const result = await useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 2 })

    expect(result.every((u) => u.status === StatusPatrimonio.DISPONIVEL)).toBe(true)
  })

  it('propaga descricao para todas as unidades', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.maxSequenceByTipo.mockResolvedValue(0)
    insumoRepo.saveMany.mockImplementation(async (arr) => arr)

    const result = await useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 2, descricao: '  Lote 2024  ' })

    expect(result.every((u) => u.descricao === 'Lote 2024')).toBe(true)
  })

  it('lança NotFoundException quando tipo não existe', async () => {
    tipoRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute({ tipoInsumoId: 'nao-existe', quantidade: 1 })).rejects.toThrow(NotFoundException)
    expect(insumoRepo.saveMany).not.toHaveBeenCalled()
  })

  it('lança BadRequestException para quantidade 0', async () => {
    await expect(useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 0 })).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException para quantidade acima de 100', async () => {
    await expect(useCase.execute({ tipoInsumoId: 'tipo-1', quantidade: 101 })).rejects.toThrow(BadRequestException)
  })
})
