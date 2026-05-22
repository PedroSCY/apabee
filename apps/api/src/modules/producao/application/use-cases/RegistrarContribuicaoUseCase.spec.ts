import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RegistrarContribuicaoUseCase } from './RegistrarContribuicaoUseCase'
import { Campanha, ICampanhaRepository, IContribuicaoRepository } from '@apa/core'
import { StatusCampanha, TipoContribuicao, TipoLote } from '@apa/shared'

const makeCampanha = (status: StatusCampanha, tipo = TipoLote.PRODUCAO) =>
  new Campanha({ id: 'c-1', codigo: 'PROD-2025-001', nome: 'Teste', tipo, dataInicio: new Date(), status, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const campanhaRepo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
const contribuicaoRepo: jest.Mocked<IContribuicaoRepository> = {
  findById: jest.fn(),
  findByCampanha: jest.fn(),
  findByAssociado: jest.fn(),
  findByCampanhaEAssociado: jest.fn(),
  sumByCampanha: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('RegistrarContribuicaoUseCase', () => {
  let useCase: RegistrarContribuicaoUseCase

  // campanha de AQUISICAO aceita DINHEIRO
  const input = {
    campanhaId: 'c-1',
    associadoId: 'assoc-1',
    tipo: TipoContribuicao.DINHEIRO,
    valorMonetario: 200,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new RegistrarContribuicaoUseCase(campanhaRepo, contribuicaoRepo)
    contribuicaoRepo.save.mockImplementation(async c => c)
  })

  it('registra contribuição DINHEIRO em campanha AQUISICAO ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.AQUISICAO))
    const result = await useCase.execute(input)
    expect(result.campanhaId).toBe('c-1')
    expect(result.valorMonetario).toBe(200)
    expect(result.liquidado).toBe(false)
    expect(contribuicaoRepo.save).toHaveBeenCalledTimes(1)
  })

  it('registra contribuição COLHEITA em campanha PRODUCAO ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.PRODUCAO))
    const inputColheita = { campanhaId: 'c-1', associadoId: 'assoc-1', tipo: TipoContribuicao.COLHEITA, valorMonetario: 0, volume: 30 }
    const result = await useCase.execute(inputColheita)
    expect(result.tipo).toBe(TipoContribuicao.COLHEITA)
    expect(contribuicaoRepo.save).toHaveBeenCalledTimes(1)
  })

  it('aplica trim na descricao', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.AQUISICAO))
    const result = await useCase.execute({ ...input, descricao: '  Pagamento em dinheiro  ' })
    expect(result.descricao).toBe('Pagamento em dinheiro')
  })

  it('rejeita tipo incompatível com campanha (DINHEIRO em PRODUCAO)', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.ATIVA, TipoLote.PRODUCAO))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })

  it('lança NotFoundException se campanha não existe', async () => {
    campanhaRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException)
  })

  it('lança BadRequestException se campanha não está ATIVA', async () => {
    campanhaRepo.findById.mockResolvedValue(makeCampanha(StatusCampanha.PLANEJADA, TipoLote.AQUISICAO))
    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException)
  })
})
