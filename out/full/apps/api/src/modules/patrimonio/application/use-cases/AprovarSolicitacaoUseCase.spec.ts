import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio, StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  AtribuicaoPatrimonio,
  IAtribuirPatrimonioUseCase,
  IInsumoRepository,
  ISolicitacaoPatrimonioRepository,
  Insumo,
  SolicitacaoPatrimonio,
  TipoInsumo,
} from '@apa/core'
import { AprovarSolicitacaoUseCase } from './AprovarSolicitacaoUseCase'

const makeTipoInsumo = (): TipoInsumo =>
  new TipoInsumo({ id: 'tipo-1', nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA, sigla: 'FUM', criadoEm: new Date() })

const makeInsumo = (id = 'ins-1'): Insumo =>
  new Insumo({ id, identificador: `FUM-001`, tipoInsumoId: 'tipo-1', tipoInsumo: makeTipoInsumo(), status: StatusPatrimonio.DISPONIVEL, criadoEm: new Date() })

const makeSolicitacaoEquipamento = (status = StatusSolicitacaoPatrimonio.PENDENTE): SolicitacaoPatrimonio =>
  new SolicitacaoPatrimonio({
    id: 'sol-1',
    tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
    patrimonioId: 'eq-1',
    associadoId: 'assoc-1',
    status,
    criadoEm: new Date(),
  })

const makeSolicitacaoInsumo = (status = StatusSolicitacaoPatrimonio.PENDENTE, quantidade = 2): SolicitacaoPatrimonio =>
  new SolicitacaoPatrimonio({
    id: 'sol-2',
    tipoPatrimonio: TipoPatrimonio.INSUMO,
    tipoInsumoId: 'tipo-1',
    quantidade,
    associadoId: 'assoc-1',
    status,
    criadoEm: new Date(),
  })

const makeSolicitacaoRepo = (): jest.Mocked<ISolicitacaoPatrimonioRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByAssociado: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
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

const makeAtribuirUseCase = (): jest.Mocked<IAtribuirPatrimonioUseCase> => ({
  execute: jest.fn(),
})

describe('AprovarSolicitacaoUseCase', () => {
  let useCase: AprovarSolicitacaoUseCase
  let solicitacaoRepo: jest.Mocked<ISolicitacaoPatrimonioRepository>
  let insumoRepo: jest.Mocked<IInsumoRepository>
  let atribuirUseCase: jest.Mocked<IAtribuirPatrimonioUseCase>

  beforeEach(() => {
    solicitacaoRepo = makeSolicitacaoRepo()
    insumoRepo = makeInsumoRepo()
    atribuirUseCase = makeAtribuirUseCase()
    useCase = new AprovarSolicitacaoUseCase(solicitacaoRepo, atribuirUseCase, insumoRepo)
  })

  describe('EQUIPAMENTO', () => {
    it('aprova solicitação e chama atribuirPatrimonio', async () => {
      const solicitacao = makeSolicitacaoEquipamento()
      solicitacaoRepo.findById.mockResolvedValue(solicitacao)
      atribuirUseCase.execute.mockResolvedValue({} as AtribuicaoPatrimonio)
      solicitacaoRepo.update.mockImplementation(async (s) => s)

      const result = await useCase.execute('sol-1')

      expect(atribuirUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ patrimonioId: 'eq-1', tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO }),
      )
      expect(result.status).toBe(StatusSolicitacaoPatrimonio.APROVADA)
    })
  })

  describe('INSUMO', () => {
    it('aprova solicitação e atribui N unidades disponíveis', async () => {
      const solicitacao = makeSolicitacaoInsumo(StatusSolicitacaoPatrimonio.PENDENTE, 2)
      solicitacaoRepo.findById.mockResolvedValue(solicitacao)
      insumoRepo.findAvailableByTipo.mockResolvedValue([makeInsumo('ins-1'), makeInsumo('ins-2')])
      atribuirUseCase.execute.mockResolvedValue({} as AtribuicaoPatrimonio)
      solicitacaoRepo.update.mockImplementation(async (s) => s)

      const result = await useCase.execute('sol-2')

      expect(atribuirUseCase.execute).toHaveBeenCalledTimes(2)
      expect(result.status).toBe(StatusSolicitacaoPatrimonio.APROVADA)
    })

    it('lança BadRequestException quando estoque insuficiente no momento da aprovação', async () => {
      const solicitacao = makeSolicitacaoInsumo(StatusSolicitacaoPatrimonio.PENDENTE, 3)
      solicitacaoRepo.findById.mockResolvedValue(solicitacao)
      insumoRepo.findAvailableByTipo.mockResolvedValue([makeInsumo('ins-1')])

      await expect(useCase.execute('sol-2')).rejects.toThrow(BadRequestException)
      expect(solicitacaoRepo.update).not.toHaveBeenCalled()
    })
  })

  it('lança NotFoundException quando solicitação não existe', async () => {
    solicitacaoRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException)
    expect(atribuirUseCase.execute).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando solicitação não está PENDENTE', async () => {
    solicitacaoRepo.findById.mockResolvedValue(makeSolicitacaoEquipamento(StatusSolicitacaoPatrimonio.APROVADA))

    await expect(useCase.execute('sol-1')).rejects.toThrow(BadRequestException)
    expect(atribuirUseCase.execute).not.toHaveBeenCalled()
  })
})
