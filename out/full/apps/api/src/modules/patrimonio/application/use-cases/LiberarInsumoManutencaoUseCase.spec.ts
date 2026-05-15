import { NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { IInsumoRepository, Insumo, TipoInsumo } from '@apa/core'
import { LiberarInsumoManutencaoUseCase } from './LiberarInsumoManutencaoUseCase'

const makeTipoInsumo = (): TipoInsumo =>
  new TipoInsumo({ id: 'tipo-1', nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA, sigla: 'FUM', criadoEm: new Date() })

const makeInsumo = (status = StatusPatrimonio.MANUTENCAO): Insumo =>
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

describe('LiberarInsumoManutencaoUseCase', () => {
  let useCase: LiberarInsumoManutencaoUseCase
  let repo: jest.Mocked<IInsumoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new LiberarInsumoManutencaoUseCase(repo)
  })

  it('muda status para DISPONIVEL quando insumo está em MANUTENCAO', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.MANUTENCAO))
    repo.update.mockImplementation(async (i) => i)

    const result = await useCase.execute('ins-1')

    expect(result.status).toBe(StatusPatrimonio.DISPONIVEL)
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ status: StatusPatrimonio.DISPONIVEL }))
  })

  it('também libera insumo que estava EM_USO', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.EM_USO))
    repo.update.mockImplementation(async (i) => i)

    const result = await useCase.execute('ins-1')

    expect(result.status).toBe(StatusPatrimonio.DISPONIVEL)
  })

  it('lança NotFoundException quando insumo não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('delega a atualização ao repositório e retorna o resultado', async () => {
    const insumo = makeInsumo(StatusPatrimonio.MANUTENCAO)
    const liberado = insumo.marcarDisponivel()
    repo.findById.mockResolvedValue(insumo)
    repo.update.mockResolvedValue(liberado)

    const result = await useCase.execute('ins-1')

    expect(repo.update).toHaveBeenCalledTimes(1)
    expect(result).toBe(liberado)
  })
})
