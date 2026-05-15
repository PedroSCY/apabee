import { StatusPatrimonio } from '@apa/shared'
import { Equipamento } from './Equipamento'

const make = (status = StatusPatrimonio.DISPONIVEL) =>
  new Equipamento({ id: 'uuid-1', nome: 'Centrífuga', status, criadoEm: new Date() })

describe('Equipamento', () => {
  it('estaDisponivel retorna true quando DISPONIVEL', () => {
    expect(make(StatusPatrimonio.DISPONIVEL).estaDisponivel()).toBe(true)
  })

  it('estaDisponivel retorna false quando EM_USO', () => {
    expect(make(StatusPatrimonio.EM_USO).estaDisponivel()).toBe(false)
  })

  it('estaDisponivel retorna false quando MANUTENCAO', () => {
    expect(make(StatusPatrimonio.MANUTENCAO).estaDisponivel()).toBe(false)
  })

  it('marcarEmUso retorna novo Equipamento com status EM_USO (imutável)', () => {
    const eq = make()
    const emUso = eq.marcarEmUso()
    expect(emUso.status).toBe(StatusPatrimonio.EM_USO)
    expect(eq.status).toBe(StatusPatrimonio.DISPONIVEL)
  })

  it('marcarDisponivel retorna novo Equipamento com status DISPONIVEL (imutável)', () => {
    const eq = make(StatusPatrimonio.EM_USO)
    const disponivel = eq.marcarDisponivel()
    expect(disponivel.status).toBe(StatusPatrimonio.DISPONIVEL)
    expect(eq.status).toBe(StatusPatrimonio.EM_USO)
  })

  it('colocarEmManutencao retorna novo Equipamento com status MANUTENCAO (imutável)', () => {
    const eq = make()
    const manutencao = eq.colocarEmManutencao()
    expect(manutencao.status).toBe(StatusPatrimonio.MANUTENCAO)
    expect(eq.status).toBe(StatusPatrimonio.DISPONIVEL)
  })
})
