import { AtualizarConfiguracaoUseCase } from './AtualizarConfiguracaoUseCase'
import { IConfiguracaoAssociacaoRepository, ConfiguracaoAssociacao } from '@apa/core'

const mockRepo: jest.Mocked<IConfiguracaoAssociacaoRepository> = {
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
}

function makeConfig(overrides?: Partial<ConstructorParameters<typeof ConfiguracaoAssociacao>[0]>): ConfiguracaoAssociacao {
  return new ConfiguracaoAssociacao({
    id: 'cfg-1',
    nomeExibido: 'APA',
    atualizadoEm: new Date(),
    ...overrides,
  })
}

describe('AtualizarConfiguracaoUseCase', () => {
  let useCase: AtualizarConfiguracaoUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new AtualizarConfiguracaoUseCase(mockRepo)
  })

  it('atualiza registro existente', async () => {
    const config = makeConfig()
    mockRepo.findOne.mockResolvedValue(config)
    mockRepo.update.mockImplementation(async (c) => c)

    const result = await useCase.execute({ nomeExibido: 'Apabee APA', corPrimaria: '#D4860B' })

    expect(result.nomeExibido).toBe('Apabee APA')
    expect(result.corPrimaria).toBe('#D4860B')
    expect(mockRepo.update).toHaveBeenCalledTimes(1)
    expect(mockRepo.save).not.toHaveBeenCalled()
  })

  it('cria singleton quando não existe nenhum registro', async () => {
    mockRepo.findOne.mockResolvedValue(null)
    mockRepo.save.mockImplementation(async (c) => c)

    const result = await useCase.execute({ nomeExibido: 'Nova APA' })

    expect(result.nomeExibido).toBe('Nova APA')
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })
})
