import { Pedido } from './Pedido'
import { ItemPedido } from './ItemPedido'
import { StatusPedido } from '@apa/shared'

const makeItem = (preco = 50, qtd = 2) =>
  new ItemPedido({
    id: 'item-1',
    pedidoId: 'ped-1',
    produtoId: 'prod-1',
    quantidade: qtd,
    precoUnitario: preco,
  })

const makePedido = (overrides = {}) =>
  new Pedido({
    id: 'ped-1',
    clienteNome: 'Maria',
    clienteEmail: 'maria@email.com',
    status: StatusPedido.PENDENTE,
    itens: [makeItem()],
    criadoEm: new Date(),
    ...overrides,
  })

describe('Pedido', () => {
  it('calcularTotal deve somar subtotais dos itens', () => {
    expect(makePedido().calcularTotal()).toBe(100)
  })

  it('confirmar deve mudar status para CONFIRMADO', () => {
    const confirmado = makePedido().confirmar()
    expect(confirmado.status).toBe(StatusPedido.CONFIRMADO)
  })

  it('confirmar pedido não-pendente deve lançar erro', () => {
    const confirmado = makePedido({ status: StatusPedido.CONFIRMADO })
    expect(() => confirmado.confirmar()).toThrow()
  })

  it('cancelar pedido pendente deve funcionar', () => {
    const cancelado = makePedido().cancelar()
    expect(cancelado.status).toBe(StatusPedido.CANCELADO)
  })

  it('cancelar pedido confirmado deve lançar erro (RN04)', () => {
    const confirmado = makePedido({ status: StatusPedido.CONFIRMADO })
    expect(() => confirmado.cancelar()).toThrow('Pedido não pode ser cancelado no status atual.')
  })

  it('marcarEnviado deve funcionar após confirmado', () => {
    const enviado = makePedido({ status: StatusPedido.CONFIRMADO }).marcarEnviado()
    expect(enviado.status).toBe(StatusPedido.ENVIADO)
  })
})
