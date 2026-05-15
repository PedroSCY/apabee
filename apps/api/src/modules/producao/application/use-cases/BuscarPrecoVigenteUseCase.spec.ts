import { BuscarPrecoVigenteUseCase } from './BuscarPrecoVigenteUseCase'
import { IPrecoSafraRepository, ITipoMateriaPrimaRepository, PrecoSafra, TipoMateriaPrima } from '@apa/core'
import { UnidadeMedida } from '@apa/shared'

const makePreco = (preco = 50) =>
  new PrecoSafra({ id: 'preco-1', tipoMateriaPrimaId: 'tipo-1', safraId: 'safra-1', preco })

const makeTipo = (precoAtual?: number) =>
  new TipoMateriaPrima({ id: 'tipo-1', nome: 'Mel', unidade: UnidadeMedida.KG, precoAtual })

const precoRepo: jest.Mocked<IPrecoSafraRepository> = {
  findByTipoESafra: jest.fn(),
  findBySafra: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}
const tipoRepo: jest.Mocked<ITipoMateriaPrimaRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
}

describe('BuscarPrecoVigenteUseCase', () => {
  let useCase: BuscarPrecoVigenteUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new BuscarPrecoVigenteUseCase(precoRepo, tipoRepo)
  })

  it('retorna preço da safra quando existe (RN28)', async () => {
    precoRepo.findByTipoESafra.mockResolvedValue(makePreco(50))
    tipoRepo.findById.mockResolvedValue(makeTipo(30))
    const result = await useCase.execute('tipo-1', 'safra-1')
    expect(result).toBe(50)
  })

  it('fallback para precoAtual do tipo quando não há preço por safra (RN28)', async () => {
    precoRepo.findByTipoESafra.mockResolvedValue(null)
    tipoRepo.findById.mockResolvedValue(makeTipo(30))
    const result = await useCase.execute('tipo-1', 'safra-1')
    expect(result).toBe(30)
  })

  it('retorna null quando nem preço safra nem precoAtual existem', async () => {
    precoRepo.findByTipoESafra.mockResolvedValue(null)
    tipoRepo.findById.mockResolvedValue(makeTipo(undefined))
    const result = await useCase.execute('tipo-1', 'safra-1')
    expect(result).toBeNull()
  })

  it('retorna null quando tipo não existe', async () => {
    precoRepo.findByTipoESafra.mockResolvedValue(null)
    tipoRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute('tipo-1', 'safra-1')
    expect(result).toBeNull()
  })
})
