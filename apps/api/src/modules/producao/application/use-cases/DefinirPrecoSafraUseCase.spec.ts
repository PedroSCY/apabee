import { NotFoundException } from '@nestjs/common'
import { DefinirPrecoSafraUseCase } from './DefinirPrecoSafraUseCase'
import { IPrecoSafraRepository, ISafraRepository, ITipoMateriaPrimaRepository, PrecoSafra, Safra, TipoMateriaPrima } from '@apa/core'
import { StatusSafra, UnidadeMedida } from '@apa/shared'

const makeSafra = () =>
  new Safra({ id: 'safra-1', nome: 'Safra', floradaId: 'florada-uuid', dataInicio: new Date(), status: StatusSafra.EM_ANDAMENTO })

const makeTipo = () =>
  new TipoMateriaPrima({ id: 'tipo-1', nome: 'Mel', unidade: UnidadeMedida.KG, precoAtual: 30 })

const makePreco = (preco = 40) =>
  new PrecoSafra({ id: 'preco-1', tipoMateriaPrimaId: 'tipo-1', safraId: 'safra-1', preco })

const precoRepo: jest.Mocked<IPrecoSafraRepository> = {
  findByTipoESafra: jest.fn(),
  findBySafra: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}
const safraRepo: jest.Mocked<ISafraRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}
const tipoRepo: jest.Mocked<ITipoMateriaPrimaRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
}

describe('DefinirPrecoSafraUseCase', () => {
  let useCase: DefinirPrecoSafraUseCase

  const input = { tipoMateriaPrimaId: 'tipo-1', safraId: 'safra-1', preco: 45 }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new DefinirPrecoSafraUseCase(precoRepo, safraRepo, tipoRepo)
    safraRepo.findById.mockResolvedValue(makeSafra())
    tipoRepo.findById.mockResolvedValue(makeTipo())
    precoRepo.save.mockImplementation(async p => p)
    precoRepo.update.mockImplementation(async p => p)
  })

  it('cria novo preço quando não existe registro para a safra', async () => {
    precoRepo.findByTipoESafra.mockResolvedValue(null)
    const result = await useCase.execute(input)
    expect(result.preco).toBe(45)
    expect(precoRepo.save).toHaveBeenCalledTimes(1)
    expect(precoRepo.update).not.toHaveBeenCalled()
  })

  it('atualiza preço existente (upsert)', async () => {
    precoRepo.findByTipoESafra.mockResolvedValue(makePreco(40))
    const result = await useCase.execute(input)
    expect(result.preco).toBe(45)
    expect(precoRepo.update).toHaveBeenCalledTimes(1)
    expect(precoRepo.save).not.toHaveBeenCalled()
  })

  it('lança NotFoundException se safra não existe', async () => {
    safraRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança NotFoundException se tipo não existe', async () => {
    tipoRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })
})
