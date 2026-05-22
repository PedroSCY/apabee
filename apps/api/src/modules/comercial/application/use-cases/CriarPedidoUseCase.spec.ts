import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CriarPedidoUseCase } from './CriarPedidoUseCase'
import {
  Campanha,
  EstoqueProduto,
  ICampanhaRepository,
  IEstoqueProdutoRepository,
  IItemPedidoRepository,
  IPedidoRepository,
  IProdutoRepository,
  Produto,
} from '@apa/core'
import { StatusCampanha, StatusPedido, StatusProduto, TipoLote } from '@apa/shared'

const makeProduto = (id = 'p-1', campanhaId?: string) =>
  new Produto({
    id,
    nome: 'Mel 500g',
    slug: 'mel-500g',
    descricao: 'Mel artesanal',
    preco: 25,
    status: StatusProduto.PUBLICADO,
    campanhaId,
    criadoEm: new Date(),
  })

const makeEstoque = (produtoId = 'p-1', qtd = 10) =>
  new EstoqueProduto({ id: 'e-1', produtoId, quantidadeDisponivel: qtd, atualizadoEm: new Date() })

const makeCampanha = (id = 'c-1', codigo = 'PROD-LAR-2025-001') =>
  new Campanha({
    id, codigo, nome: 'Mel Laranjeira', tipo: TipoLote.PRODUCAO,
    dataInicio: new Date(), status: StatusCampanha.ATIVA,
    receitaTotal: 0, custoTotal: 0, criadoEm: new Date(),
  })

const pedidoRepo: jest.Mocked<IPedidoRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}
const itemRepo: jest.Mocked<IItemPedidoRepository> = {
  findByPedido: jest.fn(),
  findByCampanhaCodigo: jest.fn(),
  saveMany: jest.fn(),
  sumQuantidadeEntregue: jest.fn(),
}
const produtoRepo: jest.Mocked<IProdutoRepository> = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAtivos: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
const estoqueRepo: jest.Mocked<IEstoqueProdutoRepository> = {
  findByProduto: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}
const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('CriarPedidoUseCase', () => {
  let useCase: CriarPedidoUseCase

  const input = {
    clienteNome: 'João Silva',
    clienteEmail: 'joao@email.com',
    itens: [{ produtoId: 'p-1', quantidade: 2 }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarPedidoUseCase(pedidoRepo, itemRepo, produtoRepo, estoqueRepo, campanhaRepo)
    pedidoRepo.save.mockImplementation(async p => p)
    itemRepo.saveMany.mockImplementation(async items => items)
  })

  it('cria pedido sem campanha — campanhaCodigo fica undefined', async () => {
    produtoRepo.findById.mockResolvedValue(makeProduto('p-1'))
    estoqueRepo.findByProduto.mockResolvedValue(makeEstoque('p-1', 10))

    await useCase.execute(input)

    const [itens] = itemRepo.saveMany.mock.calls[0]!
    expect(itens![0]!.campanhaCodigo).toBeUndefined()
    expect(campanhaRepo.findById).not.toHaveBeenCalled()
  })

  it('cria pedido com produto de campanha — campanhaCodigo preenchido (RN24)', async () => {
    produtoRepo.findById.mockResolvedValue(makeProduto('p-1', 'c-1'))
    estoqueRepo.findByProduto.mockResolvedValue(makeEstoque('p-1', 10))
    campanhaRepo.findById.mockResolvedValue(makeCampanha('c-1', 'PROD-LAR-2025-001'))

    await useCase.execute(input)

    const [itens] = itemRepo.saveMany.mock.calls[0]!
    expect(itens![0]!.campanhaCodigo).toBe('PROD-LAR-2025-001')
    expect(campanhaRepo.findById).toHaveBeenCalledWith('c-1')
  })

  it('campanhaCodigo fica undefined se campanha não existe mais', async () => {
    produtoRepo.findById.mockResolvedValue(makeProduto('p-1', 'c-inexistente'))
    estoqueRepo.findByProduto.mockResolvedValue(makeEstoque('p-1', 10))
    campanhaRepo.findById.mockResolvedValue(null)

    await useCase.execute(input)

    const [itens] = itemRepo.saveMany.mock.calls[0]!
    expect(itens![0]!.campanhaCodigo).toBeUndefined()
  })

  it('cria pedido com status PENDENTE', async () => {
    produtoRepo.findById.mockResolvedValue(makeProduto())
    estoqueRepo.findByProduto.mockResolvedValue(makeEstoque())

    await useCase.execute(input)

    const [pedido] = pedidoRepo.save.mock.calls[0]!
    expect(pedido!.status).toBe(StatusPedido.PENDENTE)
    expect(pedido!.clienteNome).toBe('João Silva')
  })

  it('lança BadRequestException se não há itens', async () => {
    await expect(useCase.execute({ ...input, itens: [] })).rejects.toThrow(BadRequestException)
  })

  it('lança NotFoundException se produto não existe', async () => {
    produtoRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se produto não está disponível', async () => {
    produtoRepo.findById.mockResolvedValue(
      new Produto({ id: 'p-1', nome: 'Mel', slug: 'mel', descricao: '', preco: 25, status: StatusProduto.RASCUNHO, criadoEm: new Date() }),
    )
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se saldo insuficiente', async () => {
    produtoRepo.findById.mockResolvedValue(makeProduto())
    estoqueRepo.findByProduto.mockResolvedValue(makeEstoque('p-1', 1))

    await expect(useCase.execute({ ...input, itens: [{ produtoId: 'p-1', quantidade: 5 }] })).rejects.toThrow(BadRequestException)
  })

  it('lança BadRequestException se estoque não existe', async () => {
    produtoRepo.findById.mockResolvedValue(makeProduto())
    estoqueRepo.findByProduto.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })
})
