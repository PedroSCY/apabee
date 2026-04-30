import { TipoLote } from '@apa/shared'
import { LoteProducao } from './LoteProducao'

const makeLote = (overrides = {}) =>
  new LoteProducao({
    id: 'uuid-1',
    tipo: TipoLote.PRODUCAO,
    periodo: '2024-01',
    dataInicio: new Date('2024-01-01'),
    ativo: true,
    custoTotal: 0,
    ...overrides,
  })

describe('LoteProducao', () => {
  it('estaAberto deve retornar true quando ativo', () => {
    expect(makeLote().estaAberto()).toBe(true)
  })

  it('encerrar deve setar ativo=false e dataFim', () => {
    const lote = makeLote()
    const encerrado = lote.encerrar()
    expect(encerrado.ativo).toBe(false)
    expect(encerrado.dataFim).toBeDefined()
  })

  it('encerrar lote já encerrado deve lançar erro', () => {
    const encerrado = makeLote({ ativo: false })
    expect(() => encerrado.encerrar()).toThrow('Lote já está encerrado.')
  })
})
