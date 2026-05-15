import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ExecutarOrdemProducaoUseCase } from './ExecutarOrdemProducaoUseCase'
import {
  ComposicaoProduto,
  EstoqueMateriaPrima,
  EstoqueProduto,
  IComposicaoProdutoRepository,
  IEstoqueMateriaPrimaRepository,
  IEstoqueProdutoRepository,
  IOrdemProducaoRepository,
  OrdemProducao,
} from '@apa/core'
import { StatusOrdemProducao, UnidadeMedida } from '@apa/shared'

const makeOrdem = (status: StatusOrdemProducao, perdaPercentual = 0) =>
  new OrdemProducao({ id: 'op-1', campanhaId: 'c-1', produtoId: 'prod-1', quantidade: 10, status, perdaPercentual, materiaisConsumidos: [], criadoEm: new Date() })

const makeComposicao = (quantidadeNecessaria = 2) =>
  new ComposicaoProduto({ id: 'comp-1', produtoId: 'prod-1', tipoMateriaPrimaId: 'tipo-1', quantidadeNecessaria, unidade: UnidadeMedida.KG })

const makeEstoqueMP = (disponivel: number) =>
  new EstoqueMateriaPrima({ id: 'est-1', tipoMateriaPrimaId: 'tipo-1', quantidadeDisponivel: disponivel, unidade: UnidadeMedida.KG, atualizadoEm: new Date() })

const makeEstoqueProduto = (qtd = 5) =>
  new EstoqueProduto({ id: 'ep-1', produtoId: 'prod-1', quantidadeDisponivel: qtd, atualizadoEm: new Date() })

const ordemRepo: jest.Mocked<IOrdemProducaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}
const estoqueRepo: jest.Mocked<IEstoqueMateriaPrimaRepository> = {
  findAll: jest.fn(),
  findByTipo: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  salvarMovimentacao: jest.fn(),
  findMovimentacoesByEstoque: jest.fn(),
}
const composicaoRepo: jest.Mocked<IComposicaoProdutoRepository> = {
  findByProduto: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}
const estoqueProdutoRepo: jest.Mocked<IEstoqueProdutoRepository> = {
  findByProduto: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

describe('ExecutarOrdemProducaoUseCase', () => {
  let useCase: ExecutarOrdemProducaoUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new ExecutarOrdemProducaoUseCase(ordemRepo, estoqueRepo, composicaoRepo, estoqueProdutoRepo)
    ordemRepo.update.mockImplementation(async o => o)
    estoqueRepo.update.mockImplementation(async e => e)
    estoqueRepo.salvarMovimentacao.mockImplementation(async m => m)
    estoqueProdutoRepo.update.mockImplementation(async e => e)
    estoqueProdutoRepo.save.mockImplementation(async e => e)
  })

  it('executa ordem, consome estoque e conclui (RN15, RN16)', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.PENDENTE))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao(2)])
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoqueMP(25))
    estoqueProdutoRepo.findByProduto.mockResolvedValue(null)

    const result = await useCase.execute('op-1')
    expect(result.status).toBe(StatusOrdemProducao.CONCLUIDA)
    expect(result.materiaisConsumidos).toHaveLength(1)
    expect(result.materiaisConsumidos[0]!.quantidade).toBe(20)
    expect(estoqueRepo.update).toHaveBeenCalledTimes(1)
    expect(estoqueRepo.salvarMovimentacao).toHaveBeenCalledTimes(1)
  })

  it('aplica perda percentual no consumo (RN16)', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.PENDENTE, 10))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao(2)])
    // consumo base: 10 × 2 = 20; com 10% perda: 20 × 1.10 = 22
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoqueMP(25))
    estoqueProdutoRepo.findByProduto.mockResolvedValue(null)

    const result = await useCase.execute('op-1')
    expect(result.materiaisConsumidos[0]!.quantidade).toBeCloseTo(22)
  })

  it('cria EstoqueProduto novo quando não existe (RN15)', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.PENDENTE))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao(2)])
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoqueMP(25))
    estoqueProdutoRepo.findByProduto.mockResolvedValue(null)

    await useCase.execute('op-1')

    expect(estoqueProdutoRepo.save).toHaveBeenCalledTimes(1)
    expect(estoqueProdutoRepo.update).not.toHaveBeenCalled()
    const [saved] = estoqueProdutoRepo.save.mock.calls[0]!
    expect(saved!.quantidadeDisponivel).toBe(10)
    expect(saved!.produtoId).toBe('prod-1')
  })

  it('incrementa EstoqueProduto existente via entrada() (RN15)', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.PENDENTE))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao(2)])
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoqueMP(25))
    estoqueProdutoRepo.findByProduto.mockResolvedValue(makeEstoqueProduto(5))

    await useCase.execute('op-1')

    expect(estoqueProdutoRepo.update).toHaveBeenCalledTimes(1)
    expect(estoqueProdutoRepo.save).not.toHaveBeenCalled()
    const [updated] = estoqueProdutoRepo.update.mock.calls[0]!
    expect(updated!.quantidadeDisponivel).toBe(15) // 5 existente + 10 produzido
  })

  it('lança NotFoundException se ordem não existe', async () => {
    ordemRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('op-1')).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se ordem não está PENDENTE', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.CONCLUIDA))
    await expect(useCase.execute('op-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se produto não tem composição', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.PENDENTE))
    composicaoRepo.findByProduto.mockResolvedValue([])
    await expect(useCase.execute('op-1')).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se estoque insuficiente', async () => {
    ordemRepo.findById.mockResolvedValue(makeOrdem(StatusOrdemProducao.PENDENTE))
    composicaoRepo.findByProduto.mockResolvedValue([makeComposicao(2)])
    // necessário 20 kg, disponível apenas 10
    estoqueRepo.findByTipo.mockResolvedValue(makeEstoqueMP(10))
    await expect(useCase.execute('op-1')).rejects.toThrow(BadRequestException)
  })
})
