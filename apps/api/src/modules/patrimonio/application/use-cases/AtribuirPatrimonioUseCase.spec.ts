import { BadRequestException, NotFoundException } from '@nestjs/common'
import { StatusAtribuicao, StatusPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  AtribuicaoPatrimonio,
  Equipamento,
  IAtribuicaoPatrimonioRepository,
  IEquipamentoRepository,
  IInsumoRepository,
} from '@apa/core'
import { AtribuirPatrimonioUseCase } from './AtribuirPatrimonioUseCase'

const makeEquipamento = (status = StatusPatrimonio.DISPONIVEL): Equipamento =>
  new Equipamento({ id: 'eq-1', nome: 'Centrífuga', status, criadoEm: new Date() })

const makeAtribuicao = (): AtribuicaoPatrimonio =>
  new AtribuicaoPatrimonio({
    id: 'atr-1',
    patrimonioId: 'eq-1',
    tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
    associadoId: 'asc-1',
    dataInicio: new Date(),
    status: StatusAtribuicao.ATIVO,
  })

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

describe('AtribuirPatrimonioUseCase', () => {
  let useCase: AtribuirPatrimonioUseCase
  let eqRepo: jest.Mocked<IEquipamentoRepository>
  let insRepo: jest.Mocked<IInsumoRepository>
  let atrRepo: jest.Mocked<IAtribuicaoPatrimonioRepository>

  beforeEach(() => {
    eqRepo = makeEquipamentoRepo()
    insRepo = makeInsumoRepo()
    atrRepo = makeAtribuicaoRepo()
    useCase = new AtribuirPatrimonioUseCase(eqRepo, insRepo, atrRepo)
  })

  it('atribui equipamento disponível e muda status para EM_USO', async () => {
    atrRepo.findAtivaByPatrimonio.mockResolvedValue(null)
    eqRepo.findById.mockResolvedValue(makeEquipamento())
    eqRepo.update.mockImplementation(async (e) => e)
    atrRepo.save.mockImplementation(async (a) => a)

    const result = await useCase.execute({
      patrimonioId: 'eq-1',
      tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
      associadoId: 'asc-1',
    })

    expect(eqRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusPatrimonio.EM_USO }),
    )
    expect(result.associadoId).toBe('asc-1')
  })

  it('lança BadRequestException se já existe atribuição ativa (RN02)', async () => {
    atrRepo.findAtivaByPatrimonio.mockResolvedValue(makeAtribuicao())

    await expect(
      useCase.execute({
        patrimonioId: 'eq-1',
        tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
        associadoId: 'asc-2',
      }),
    ).rejects.toThrow(BadRequestException)

    expect(eqRepo.update).not.toHaveBeenCalled()
  })

  it('lança NotFoundException quando equipamento não existe', async () => {
    atrRepo.findAtivaByPatrimonio.mockResolvedValue(null)
    eqRepo.findById.mockResolvedValue(null)

    await expect(
      useCase.execute({
        patrimonioId: 'inexistente',
        tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
        associadoId: 'asc-1',
      }),
    ).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException quando patrimônio não está disponível', async () => {
    atrRepo.findAtivaByPatrimonio.mockResolvedValue(null)
    eqRepo.findById.mockResolvedValue(makeEquipamento(StatusPatrimonio.MANUTENCAO))

    await expect(
      useCase.execute({
        patrimonioId: 'eq-1',
        tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
        associadoId: 'asc-1',
      }),
    ).rejects.toThrow(BadRequestException)
  })
})
