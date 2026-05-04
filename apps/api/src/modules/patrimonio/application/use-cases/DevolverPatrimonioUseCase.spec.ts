import { NotFoundException } from '@nestjs/common'
import { StatusAtribuicao, StatusPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  AtribuicaoPatrimonio,
  Equipamento,
  IAtribuicaoPatrimonioRepository,
  IEquipamentoRepository,
  IInsumoRepository,
} from '@apa/core'
import { DevolverPatrimonioUseCase } from './DevolverPatrimonioUseCase'

const makeAtribuicaoEquipamento = (): AtribuicaoPatrimonio =>
  new AtribuicaoPatrimonio({
    id: 'atr-1',
    patrimonioId: 'eq-1',
    tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
    associadoId: 'asc-1',
    dataInicio: new Date(),
    status: StatusAtribuicao.ATIVO,
  })

const makeEquipamento = (): Equipamento =>
  new Equipamento({ id: 'eq-1', nome: 'Centrífuga', status: StatusPatrimonio.EM_USO, criadoEm: new Date() })

const makeEquipamentoRepo = (): jest.Mocked<IEquipamentoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findDisponiveis: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

const makeInsumoRepo = (): jest.Mocked<IInsumoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

const makeAtribuicaoRepo = (): jest.Mocked<IAtribuicaoPatrimonioRepository> => ({
  findById: jest.fn(),
  findByAssociado: jest.fn(),
  findByAssociadoETipo: jest.fn(),
  findAtivaByPatrimonio: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

describe('DevolverPatrimonioUseCase', () => {
  let useCase: DevolverPatrimonioUseCase
  let eqRepo: jest.Mocked<IEquipamentoRepository>
  let insRepo: jest.Mocked<IInsumoRepository>
  let atrRepo: jest.Mocked<IAtribuicaoPatrimonioRepository>

  beforeEach(() => {
    eqRepo = makeEquipamentoRepo()
    insRepo = makeInsumoRepo()
    atrRepo = makeAtribuicaoRepo()
    useCase = new DevolverPatrimonioUseCase(eqRepo, insRepo, atrRepo)
  })

  it('encerra atribuição e marca equipamento como DISPONIVEL', async () => {
    atrRepo.findById.mockResolvedValue(makeAtribuicaoEquipamento())
    eqRepo.findById.mockResolvedValue(makeEquipamento())
    eqRepo.update.mockImplementation(async (e) => e)
    atrRepo.update.mockImplementation(async (a) => a)

    const result = await useCase.execute('atr-1')

    expect(eqRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusPatrimonio.DISPONIVEL }),
    )
    expect(result.status).toBe(StatusAtribuicao.DEVOLVIDO)
    expect(result.dataFim).toBeDefined()
  })

  it('lança NotFoundException quando atribuição não existe', async () => {
    atrRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException)
    expect(eqRepo.update).not.toHaveBeenCalled()
  })
})
