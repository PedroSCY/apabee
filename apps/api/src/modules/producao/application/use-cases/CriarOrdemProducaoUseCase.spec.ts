import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { CriarOrdemProducaoUseCase } from './CriarOrdemProducaoUseCase'
import {
  Campanha,
  ComposicaoProduto,
  EstoqueCampanha,
  ICampanhaRepository,
  IComposicaoProdutoRepository,
  IEstoqueCampanhaRepository,
  IOrdemProducaoRepository,
  IProdutoRepository,
  Produto,
} from '@apa/core'
import { StatusCampanha, StatusOrdemProducao, StatusProduto, TipoLote, UnidadeMedida } from '@apa/shared'

const makeCampanha = (tipo: TipoLote, status: StatusCampanha) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const makeProduto = (campanhaId?: string) =>
  new Produto({ id: 'prod-1', nome: 'Mel', slug: 'mel', descricao: 'Mel puro', preco: 10, status: StatusProduto.PUBLICADO, campanhaId, criadoEm: new Date() })

const makeComposicao = (tipoId: string, qtd: number) =>
  new ComposicaoProduto({ id: 'comp-1', produtoId: 'prod-1', tipoMateriaPrimaId: tipoId, quantidadeNecessaria: qtd, unidade: UnidadeMedida.KG })

const makeEstoqueCampanha = (disponivel: number) =>
  new EstoqueCampanha({ id: 'ec-1', campanhaId: 'c-1', tipoMateriaPrimaId: 'tipo-1', quantidadeDisponivel: disponivel, unidade: UnidadeMedida.KG, atualizadoEm: new Date() })

const campanhaRepo = { findById: jest.fn(), findByCodigo: jest.fn(), findAll: jest.fn(), findVencidas: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn() } as jest.Mocked<ICampanhaRepository>
const ordemRepo = { findById: jest.fn(), findByCampanha: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn() } as jest.Mocked<IOrdemProducaoRepository>
const estoqueCampanhaRepo = { findByCampanha: jest.fn(), findByCampanhaETipo: jest.fn(), save: jest.fn(), update: jest.fn(), salvarMovimentacao: jest.fn(), countSaidas: jest.fn(), findMovimentacoes: jest.fn() } as jest.Mocked<IEstoqueCampanhaRepository>
const composicaoRepo = { findByProduto: jest.fn(), save: jest.fn(), delete: jest.fn() } as jest.Mocked<IComposicaoProdutoRepository>
const produtoRepo = { findById: jest.fn(), findBySlug: jest.fn(), findAtivos: jest.fn(), findAll: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn() } as jest.Mocked<IProdutoRepository>

describe('CriarOrdemProducaoUseCase', () => {
  let useCase: CriarOrdemProducaoUseCase

  const input = { campanhaId: 'c-1', produtoId: 'prod-1', quantidade: 50 }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarOrdemProducaoUseCase(campanhaRepo, ordemRepo, estoqueCampanhaRepo, composicaoRepo, produtoRepo)
    ordemRepo.save.mockImplementation(async o => o)
    produtoRepo.findById.mockResolvedValue(makeProduto())
    composicaoRepo.findByProduto.mockResolvedValue([])
  })

  it('cria ordem com status PENDENTE', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    const result = await useCase.execute(input)
    expect(result.status).toBe(StatusOrdemProducao.PENDENTE)
    expect(result.quantidade).toBe(50)
    expect(result.perdaPercentual).toBe(0)
    expect(ordemRepo.save).toHaveBeenCalledTimes(1)
  })

  it('usa perdaPercentual fornecido', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    const result = await useCase.execute({ ...input, perdaPercentual: 5 })
    expect(result.perdaPercentual).toBe(5)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha é AQUISICAO', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.AQUISICAO, StatusCampanha.ATIVA))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se campanha não está ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.PLANEJADA))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se quantidade <= 0', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    await expect(useCase.execute({ ...input, quantidade: 0 })).rejects.toThrow(BadRequestException)
  })

  it('[D2] lança NotFoundException se produto não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    produtoRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('[D2] lança ConflictException se produto já está vinculado a outra campanha', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    produtoRepo.findById.mockResolvedValue(makeProduto('c-outra'))
    await expect(useCase.execute(input)).rejects.toThrow(ConflictException)
  })

  it('[D2] permite criar ordem se produto já está vinculado à mesma campanha', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    produtoRepo.findById.mockResolvedValue(makeProduto('c-1'))
    const result = await useCase.execute(input)
    expect(result.status).toBe(StatusOrdemProducao.PENDENTE)
  })

  it('[D5] lança BadRequestException se estoque da campanha é insuficiente', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao('tipo-1', 2)])
    estoqueCampanhaRepo.findByCampanhaETipo.mockResolvedValue(makeEstoqueCampanha(50))
    // necessário = 2 * 50 = 100, disponível = 50 → insuficiente
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('[D5] lança BadRequestException se estoque da campanha não existe para o material', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao('tipo-1', 1)])
    estoqueCampanhaRepo.findByCampanhaETipo.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('[D5] cria ordem quando estoque é suficiente', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(TipoLote.PRODUCAO, StatusCampanha.ATIVA))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao('tipo-1', 1)])
    estoqueCampanhaRepo.findByCampanhaETipo.mockResolvedValue(makeEstoqueCampanha(100))
    // necessário = 1 * 50 = 50, disponível = 100 → suficiente
    const result = await useCase.execute(input)
    expect(result.status).toBe(StatusOrdemProducao.PENDENTE)
  })
})
