import { TipoLote, StatusLote } from '@apa/shared'
import { LoteProducao } from './LoteProducao'

const makeLote = (overrides = {}) =>
  new LoteProducao({
    id: 'uuid-1',
    tipo: TipoLote.PRODUCAO,
    periodo: '2024-01',
    dataInicio: new Date('2024-01-01'),
    status: StatusLote.ABERTO,
    custoTotal: 0,
    ...overrides,
  })

describe('LoteProducao', () => {
  it('estaAberto deve retornar true quando ABERTO', () => {
    expect(makeLote().estaAberto()).toBe(true)
  })

  it('estaAberto deve retornar false quando FECHADO', () => {
    expect(makeLote({ status: StatusLote.FECHADO }).estaAberto()).toBe(false)
  })

  it('encerrar deve setar status FECHADO e dataFim (imutável)', () => {
    const lote = makeLote()
    const encerrado = lote.encerrar()
    expect(encerrado.status).toBe(StatusLote.FECHADO)
    expect(encerrado.dataFim).toBeDefined()
    expect(lote.status).toBe(StatusLote.ABERTO)
  })

  it('encerrar lote já encerrado deve lançar erro', () => {
    const encerrado = makeLote({ status: StatusLote.FECHADO })
    expect(() => encerrado.encerrar()).toThrow('Lote já está encerrado.')
  })
})
