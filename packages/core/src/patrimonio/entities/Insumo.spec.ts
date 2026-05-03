import { CategoriaInsumo, StatusPatrimonio } from '@apa/shared'
import { Insumo } from './Insumo'

const make = (status = StatusPatrimonio.DISPONIVEL) =>
  new Insumo({
    id: 'uuid-1',
    nome: 'Cera alveolada',
    categoria: CategoriaInsumo.INSUMO,
    status,
    criadoEm: new Date(),
  })

describe('Insumo', () => {
  it('estaDisponivel retorna true quando DISPONIVEL', () => {
    expect(make(StatusPatrimonio.DISPONIVEL).estaDisponivel()).toBe(true)
  })

  it('estaDisponivel retorna false quando EM_USO', () => {
    expect(make(StatusPatrimonio.EM_USO).estaDisponivel()).toBe(false)
  })

  it('marcarEmUso é imutável', () => {
    const ins = make()
    const emUso = ins.marcarEmUso()
    expect(emUso.status).toBe(StatusPatrimonio.EM_USO)
    expect(ins.status).toBe(StatusPatrimonio.DISPONIVEL)
  })

  it('marcarDisponivel é imutável', () => {
    const ins = make(StatusPatrimonio.EM_USO)
    const disp = ins.marcarDisponivel()
    expect(disp.status).toBe(StatusPatrimonio.DISPONIVEL)
    expect(ins.status).toBe(StatusPatrimonio.EM_USO)
  })

  it('colocarEmManutencao é imutável', () => {
    const ins = make()
    const manut = ins.colocarEmManutencao()
    expect(manut.status).toBe(StatusPatrimonio.MANUTENCAO)
    expect(ins.status).toBe(StatusPatrimonio.DISPONIVEL)
  })
})
