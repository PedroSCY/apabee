import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { IInsumoRepository, Insumo, TipoInsumo } from '@apa/core'
import { ColocarInsumoEmManutencaoUseCase } from './ColocarInsumoEmManutencaoUseCase'

const makeTipoInsumo = (): TipoInsumo =>
  new TipoInsumo({ id: 'tipo-1', nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA, sigla: 'FUM', criadoEm: new Date() })

const makeInsumo = (status = StatusPatrimonio.DISPONIVEL): Insumo =>
  new Insumo({ id: 'ins-1', identificador: 'FUM-001', tipoInsumoId: 'tipo-1', tipoInsumo: makeTipoInsumo(), status, criadoEm: new Date() })

const makeRepo = (): jest.Mocked<IInsumoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findAvailableByTipo: jest.fn(),
  maxSequenceByTipo: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

describe('ColocarInsumoEmManutencaoUseCase', () => {
  let useCase: ColocarInsumoEmManutencaoUseCase
  let repo: jest.Mocked<IInsumoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ColocarInsumoEmManutencaoUseCase(repo)
  })

  it('muda status para MANUTENCAO quando insumo está DISPONIVEL', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.DISPONIVEL))
    repo.update.mockImplementation(async (i) => i)

    const result = await useCase.execute('ins-1')

    expect(result.status).toBe(StatusPatrimonio.MANUTENCAO)
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ status: StatusPatrimonio.MANUTENCAO }))
  })

  it('lança NotFoundException quando insumo não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando insumo está EM_USO', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.EM_USO))

    await expect(useCase.execute('ins-1')).rejects.toThrow(BadRequestException)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando insumo já está MANUTENCAO', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.MANUTENCAO))

    await expect(useCase.execute('ins-1')).rejects.toThrow(BadRequestException)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
