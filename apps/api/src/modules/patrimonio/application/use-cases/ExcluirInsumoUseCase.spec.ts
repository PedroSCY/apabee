import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { IInsumoRepository, Insumo, TipoInsumo } from '@apa/core'
import { ExcluirInsumoUseCase } from './ExcluirInsumoUseCase'

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

describe('ExcluirInsumoUseCase', () => {
  let useCase: ExcluirInsumoUseCase
  let repo: jest.Mocked<IInsumoRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ExcluirInsumoUseCase(repo)
  })

  it('exclui insumo DISPONIVEL com sucesso', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.DISPONIVEL))
    repo.delete.mockResolvedValue(undefined)

    await useCase.execute('ins-1')

    expect(repo.delete).toHaveBeenCalledWith('ins-1')
  })

  it('exclui insumo em MANUTENCAO com sucesso', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.MANUTENCAO))
    repo.delete.mockResolvedValue(undefined)

    await useCase.execute('ins-1')

    expect(repo.delete).toHaveBeenCalledWith('ins-1')
  })

  it('lança NotFoundException quando insumo não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException)
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando insumo está EM_USO', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.EM_USO))

    await expect(useCase.execute('ins-1')).rejects.toThrow(BadRequestException)
    expect(repo.delete).not.toHaveBeenCalled()
  })

  it('mensagem de erro menciona devolução quando EM_USO', async () => {
    repo.findById.mockResolvedValue(makeInsumo(StatusPatrimonio.EM_USO))

    await expect(useCase.execute('ins-1')).rejects.toThrow(/devolução/)
  })
})
