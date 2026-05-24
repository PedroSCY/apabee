import { MetodoPagamentoMensalidade, StatusMensalidade } from '@apa/shared'
import { BadRequestException } from '@nestjs/common'
import { Mensalidade } from './Mensalidade'

interface MensalidadeOverrides {
  status?: StatusMensalidade
  motivoIsencao?: string
  competenciaAno?: number
  competenciaMes?: number
}

const makeMensalidade = (overrides: MensalidadeOverrides = {}) =>
  new Mensalidade({
    id: 'mens-1',
    associadoId: 'assoc-1',
    competenciaAno: overrides.competenciaAno ?? 2025,
    competenciaMes: overrides.competenciaMes ?? 5,
    valor: 30,
    status: overrides.status ?? StatusMensalidade.PENDENTE,
    motivoIsencao: overrides.motivoIsencao,
    criadoEm: new Date('2025-05-01'),
  })

describe('Mensalidade', () => {
  describe('quitar()', () => {
    it('transita PENDENTE → PAGO com método e data', () => {
      const m = makeMensalidade()
      const quitada = m.quitar(MetodoPagamentoMensalidade.PRESENCIAL)
      expect(quitada.status).toBe(StatusMensalidade.PAGO)
      expect(quitada.metodoPagamento).toBe(MetodoPagamentoMensalidade.PRESENCIAL)
      expect(quitada.dataPagamento).toBeInstanceOf(Date)
    })

    it('não altera a instância original (imutabilidade)', () => {
      const m = makeMensalidade()
      m.quitar(MetodoPagamentoMensalidade.PRESENCIAL)
      expect(m.status).toBe(StatusMensalidade.PENDENTE)
    })

    it('lança BadRequestException se já PAGO', () => {
      const m = makeMensalidade({ status: StatusMensalidade.PAGO })
      expect(() => m.quitar(MetodoPagamentoMensalidade.PRESENCIAL)).toThrow(BadRequestException)
    })

    it('lança BadRequestException se ISENTO', () => {
      const m = makeMensalidade({ status: StatusMensalidade.ISENTO })
      expect(() => m.quitar(MetodoPagamentoMensalidade.PRESENCIAL)).toThrow(BadRequestException)
    })
  })

  describe('isentar()', () => {
    it('transita PENDENTE → ISENTO com motivo', () => {
      const m = makeMensalidade()
      const isenta = m.isentar('Associado fundador')
      expect(isenta.status).toBe(StatusMensalidade.ISENTO)
      expect(isenta.motivoIsencao).toBe('Associado fundador')
    })

    it('isenção sem motivo é permitida', () => {
      const m = makeMensalidade()
      const isenta = m.isentar()
      expect(isenta.status).toBe(StatusMensalidade.ISENTO)
      expect(isenta.motivoIsencao).toBeUndefined()
    })

    it('lança BadRequestException se já PAGO', () => {
      const m = makeMensalidade({ status: StatusMensalidade.PAGO })
      expect(() => m.isentar()).toThrow(BadRequestException)
    })
  })

  describe('reativar()', () => {
    it('transita ISENTO → PENDENTE e limpa motivoIsencao', () => {
      const m = makeMensalidade({ status: StatusMensalidade.ISENTO, motivoIsencao: 'Motivo X' })
      const reativada = m.reativar()
      expect(reativada.status).toBe(StatusMensalidade.PENDENTE)
      expect(reativada.motivoIsencao).toBeUndefined()
    })

    it('lança BadRequestException se PENDENTE', () => {
      const m = makeMensalidade()
      expect(() => m.reativar()).toThrow(BadRequestException)
    })

    it('lança BadRequestException se PAGO', () => {
      const m = makeMensalidade({ status: StatusMensalidade.PAGO })
      expect(() => m.reativar()).toThrow(BadRequestException)
    })
  })

  describe('competenciaLabel', () => {
    it('retorna "Mai/2025" para mês 5', () => {
      const m = makeMensalidade()
      expect(m.competenciaLabel).toBe('Mai/2025')
    })

    it('retorna "Jan/2024" para mês 1', () => {
      const m = makeMensalidade({ competenciaAno: 2024, competenciaMes: 1 })
      expect(m.competenciaLabel).toBe('Jan/2024')
    })
  })
})
