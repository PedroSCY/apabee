import { NotFoundException } from '@nestjs/common'
import { ConsultarApuracaoUseCase } from './ConsultarApuracaoUseCase'
import { IApuracaoCampanhaRepository, ApuracaoCampanha } from '@apa/core'

const makeApuracao = (campanhaId = 'c-1'): ApuracaoCampanha =>
  new ApuracaoCampanha({
    id: 'ap-1',
    campanhaId,
    faturamentoTotal: 1000,
    custoTotal: 200,
    lucroLiquido: 800,
    liquidadoEm: new Date(),
    rateios: [
      { associadoId: 'assoc-A', contribuicaoTotal: 500, percentual: 0.5, valorBruto: 500, custosRateados: 100, antecipacoes: 0, valorFinal: 400 },
    ],
  })

const makeRepo = (): jest.Mocked<IApuracaoCampanhaRepository> => ({
  findByCampanha: jest.fn(),
  save: jest.fn(),
})

describe('ConsultarApuracaoUseCase', () => {
  let useCase: ConsultarApuracaoUseCase
  let repo: jest.Mocked<IApuracaoCampanhaRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ConsultarApuracaoUseCase(repo)
  })

  it('retorna apuração existente', async () => {
    const apuracao = makeApuracao()
    repo.findByCampanha.mockResolvedValue(apuracao)

    const result = await useCase.execute('c-1')

    expect(repo.findByCampanha).toHaveBeenCalledWith('c-1')
    expect(result).toBe(apuracao)
  })

  it('lança NotFoundException se campanha não foi liquidada', async () => {
    repo.findByCampanha.mockResolvedValue(null)

    await expect(useCase.execute('c-inexistente')).rejects.toThrow(NotFoundException)
  })
})
