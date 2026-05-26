import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriaInsumo, StatusPatrimonio, StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  Equipamento,
  IEquipamentoRepository,
  IInsumoRepository,
  ISolicitacaoPatrimonioRepository,
  ITipoInsumoRepository,
  Insumo,
  TipoInsumo,
} from '@apa/core'
import { CriarSolicitacaoUseCase } from './CriarSolicitacaoUseCase'

const makeTipoInsumo = (): TipoInsumo =>
  new TipoInsumo({ id: 'tipo-1', nome: 'Fumigador', categoria: CategoriaInsumo.FERRAMENTA, sigla: 'FUM', criadoEm: new Date() })

const makeEquipamento = (disponivel = true): Equipamento =>
  new Equipamento({
    id: 'eq-1',
    nome: 'Extrator',
    status: disponivel ? StatusPatrimonio.DISPONIVEL : StatusPatrimonio.EM_USO,
    criadoEm: new Date(),
  })

const makeInsumo = (id = 'ins-1'): Insumo =>
  new Insumo({ id, identificador: `FUM-00${id.slice(-1)}`, tipoInsumoId: 'tipo-1', tipoInsumo: makeTipoInsumo(), status: StatusPatrimonio.DISPONIVEL, criadoEm: new Date() })

const makeEquipamentoRepo = (): jest.Mocked<IEquipamentoRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findDisponiveis: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

const makeTipoInsumoRepo = (): jest.Mocked<ITipoInsumoRepository> => ({
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

const makeSolicitacaoRepo = (): jest.Mocked<ISolicitacaoPatrimonioRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByAssociado: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

describe('CriarSolicitacaoUseCase', () => {
  let useCase: CriarSolicitacaoUseCase
  let equipamentoRepo: jest.Mocked<IEquipamentoRepository>
  let tipoInsumoRepo: jest.Mocked<ITipoInsumoRepository>
  let insumoRepo: jest.Mocked<IInsumoRepository>
  let solicitacaoRepo: jest.Mocked<ISolicitacaoPatrimonioRepository>

  beforeEach(() => {
    equipamentoRepo = makeEquipamentoRepo()
    tipoInsumoRepo = makeTipoInsumoRepo()
    insumoRepo = makeInsumoRepo()
    solicitacaoRepo = makeSolicitacaoRepo()
    useCase = new CriarSolicitacaoUseCase(equipamentoRepo, tipoInsumoRepo, insumoRepo, solicitacaoRepo, { enviarParaAdmins: jest.fn() } as any)
  })

  describe('EQUIPAMENTO', () => {
    it('cria solicitação PENDENTE para equipamento disponível', async () => {
      equipamentoRepo.findById.mockResolvedValue(makeEquipamento(true))
      solicitacaoRepo.save.mockImplementation(async (s) => s)

      const result = await useCase.execute({
        tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
        patrimonioId: 'eq-1',
        associadoId: 'assoc-1',
      })

      expect(result.status).toBe(StatusSolicitacaoPatrimonio.PENDENTE)
      expect(result.tipoPatrimonio).toBe(TipoPatrimonio.EQUIPAMENTO)
      expect(result.patrimonioId).toBe('eq-1')
      expect(solicitacaoRepo.save).toHaveBeenCalledTimes(1)
    })

    it('lança NotFoundException quando equipamento não existe', async () => {
      equipamentoRepo.findById.mockResolvedValue(null)

      await expect(
        useCase.execute({ tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO, patrimonioId: 'nao-existe', associadoId: 'assoc-1' }),
      ).rejects.toThrow(NotFoundException)

      expect(solicitacaoRepo.save).not.toHaveBeenCalled()
    })

    it('lança BadRequestException quando equipamento não está disponível', async () => {
      equipamentoRepo.findById.mockResolvedValue(makeEquipamento(false))

      await expect(
        useCase.execute({ tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO, patrimonioId: 'eq-1', associadoId: 'assoc-1' }),
      ).rejects.toThrow(BadRequestException)

      expect(solicitacaoRepo.save).not.toHaveBeenCalled()
    })
  })

  describe('INSUMO', () => {
    it('cria solicitação PENDENTE para tipo com unidades disponíveis', async () => {
      tipoInsumoRepo.findById.mockResolvedValue(makeTipoInsumo())
      insumoRepo.findAvailableByTipo.mockResolvedValue([makeInsumo('ins-1'), makeInsumo('ins-2')])
      solicitacaoRepo.save.mockImplementation(async (s) => s)

      const result = await useCase.execute({
        tipoPatrimonio: TipoPatrimonio.INSUMO,
        tipoInsumoId: 'tipo-1',
        quantidade: 2,
        associadoId: 'assoc-1',
      })

      expect(result.status).toBe(StatusSolicitacaoPatrimonio.PENDENTE)
      expect(result.tipoPatrimonio).toBe(TipoPatrimonio.INSUMO)
      expect(result.tipoInsumoId).toBe('tipo-1')
      expect(result.quantidade).toBe(2)
    })

    it('lança NotFoundException quando tipo de insumo não existe', async () => {
      tipoInsumoRepo.findById.mockResolvedValue(null)

      await expect(
        useCase.execute({ tipoPatrimonio: TipoPatrimonio.INSUMO, tipoInsumoId: 'nao-existe', quantidade: 1, associadoId: 'assoc-1' }),
      ).rejects.toThrow(NotFoundException)

      expect(solicitacaoRepo.save).not.toHaveBeenCalled()
    })

    it('lança BadRequestException quando estoque insuficiente', async () => {
      tipoInsumoRepo.findById.mockResolvedValue(makeTipoInsumo())
      // Apenas 1 disponível, mas solicitou 3
      insumoRepo.findAvailableByTipo.mockResolvedValue([makeInsumo('ins-1')])

      await expect(
        useCase.execute({ tipoPatrimonio: TipoPatrimonio.INSUMO, tipoInsumoId: 'tipo-1', quantidade: 3, associadoId: 'assoc-1' }),
      ).rejects.toThrow(BadRequestException)

      expect(solicitacaoRepo.save).not.toHaveBeenCalled()
    })

    it('mensagem de erro inclui quantidade disponível e nome do tipo', async () => {
      tipoInsumoRepo.findById.mockResolvedValue(makeTipoInsumo())
      insumoRepo.findAvailableByTipo.mockResolvedValue([])

      await expect(
        useCase.execute({ tipoPatrimonio: TipoPatrimonio.INSUMO, tipoInsumoId: 'tipo-1', quantidade: 2, associadoId: 'assoc-1' }),
      ).rejects.toThrow(/0 unidade/)
    })

    it('propaga justificativa para a solicitação', async () => {
      tipoInsumoRepo.findById.mockResolvedValue(makeTipoInsumo())
      insumoRepo.findAvailableByTipo.mockResolvedValue([makeInsumo('ins-1')])
      solicitacaoRepo.save.mockImplementation(async (s) => s)

      const result = await useCase.execute({
        tipoPatrimonio: TipoPatrimonio.INSUMO,
        tipoInsumoId: 'tipo-1',
        quantidade: 1,
        associadoId: 'assoc-1',
        justificativa: 'Necessário para colheita',
      })

      expect(result.justificativa).toBe('Necessário para colheita')
    })
  })
})
