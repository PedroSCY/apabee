import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { IInsumoRepository, ITipoInsumoRepository, Insumo, TipoInsumo } from '@apa/core'
import { ExcluirTipoInsumoUseCase } from './ExcluirTipoInsumoUseCase'

const makeTipoInsumo = (): TipoInsumo =>
  new TipoInsumo({ id: 'tipo-1', nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA, sigla: 'FUM', criadoEm: new Date() })

const makeInsumo = (): Insumo =>
  new Insumo({
    id: 'ins-1',
    identificador: 'FUM-001',
    tipoInsumoId: 'tipo-1',
    tipoInsumo: makeTipoInsumo(),
    status: StatusPatrimonio.DISPONIVEL,
    criadoEm: new Date(),
  })

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

describe('ExcluirTipoInsumoUseCase', () => {
  let useCase: ExcluirTipoInsumoUseCase
  let tipoRepo: jest.Mocked<ITipoInsumoRepository>
  let insumoRepo: jest.Mocked<IInsumoRepository>

  beforeEach(() => {
    tipoRepo = makeTipoRepo()
    insumoRepo = makeInsumoRepo()
    useCase = new ExcluirTipoInsumoUseCase(tipoRepo, insumoRepo)
  })

  it('exclui tipo sem unidades vinculadas', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.findAll.mockResolvedValue([])

    await useCase.execute('tipo-1')

    expect(tipoRepo.delete).toHaveBeenCalledWith('tipo-1')
  })

  it('lança NotFoundException quando tipo não existe', async () => {
    tipoRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException)
    expect(tipoRepo.delete).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando existem unidades vinculadas', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.findAll.mockResolvedValue([makeInsumo()])

    await expect(useCase.execute('tipo-1')).rejects.toThrow(BadRequestException)
    expect(tipoRepo.delete).not.toHaveBeenCalled()
  })

  it('mensagem de erro inclui a contagem de unidades', async () => {
    tipoRepo.findById.mockResolvedValue(makeTipoInsumo())
    insumoRepo.findAll.mockResolvedValue([makeInsumo(), makeInsumo()])

    await expect(useCase.execute('tipo-1')).rejects.toThrow(/2 unidade/)
  })
})
