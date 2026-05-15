import { BadRequestException } from '@nestjs/common'
import { CriarCampanhaUseCase } from './CriarCampanhaUseCase'
import { Campanha, ICampanhaRepository } from '@apa/core'
import { StatusCampanha, TipoLote } from '@apa/shared'

const makeCampanha = (tipo: TipoLote, codigo: string) =>
  new Campanha({ id: 'c-1', codigo, nome: 'Teste', tipo, dataInicio: new Date('2025-01-01'), status: StatusCampanha.PLANEJADA, receitaTotal: 0, custoTotal: 0, criadoEm: new Date() })

const repo: jest.Mocked<ICampanhaRepository> = {
  findById: jest.fn(),
  findByCodigo: jest.fn(),
  findAll: jest.fn(),
  findVencidas: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('CriarCampanhaUseCase', () => {
  let useCase: CriarCampanhaUseCase

  const baseInput = {
    nome: 'Campanha Mel 2025',
    tipo: TipoLote.PRODUCAO,
    dataInicio: new Date('2025-09-01'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new CriarCampanhaUseCase(repo)
    repo.save.mockImplementation(async c => c)
    repo.findAll.mockResolvedValue([])
  })

  it('cria campanha PRODUCAO com código PROD-YYYY-001 quando não há anterior no ano', async () => {
    const result = await useCase.execute(baseInput)
    expect(result.codigo).toBe('PROD-2025-001')
    expect(result.status).toBe(StatusCampanha.PLANEJADA)
    expect(result.receitaTotal).toBe(0)
  })

  it('incrementa sequencial baseado em campanhas existentes do mesmo tipo/ano', async () => {
    repo.findAll.mockResolvedValue([
      makeCampanha(TipoLote.PRODUCAO, 'PROD-2025-001'),
      makeCampanha(TipoLote.PRODUCAO, 'PROD-2025-002'),
    ])
    const result = await useCase.execute(baseInput)
    expect(result.codigo).toBe('PROD-2025-003')
  })

  it('cria campanha AQUISICAO com código AQUI-YYYY-001', async () => {
    const result = await useCase.execute({ ...baseInput, tipo: TipoLote.AQUISICAO, valorMeta: 1000 })
    expect(result.codigo).toBe('AQUI-2025-001')
  })

  it('lança BadRequestException se AQUISICAO sem valorMeta', async () => {
    await expect(useCase.execute({ ...baseInput, tipo: TipoLote.AQUISICAO })).rejects.toThrow(BadRequestException)
  })

  it('não confunde sequenciais entre PRODUCAO e AQUISICAO', async () => {
    repo.findAll.mockResolvedValue([
      makeCampanha(TipoLote.AQUISICAO, 'AQUI-2025-001'),
    ])
    const result = await useCase.execute(baseInput)
    expect(result.codigo).toBe('PROD-2025-001')
  })
})
