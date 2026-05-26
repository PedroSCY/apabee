import { BadRequestException, NotFoundException } from '@nestjs/common'
import { StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import { ISolicitacaoPatrimonioRepository, SolicitacaoPatrimonio } from '@apa/core'
import { RejeitarSolicitacaoUseCase } from './RejeitarSolicitacaoUseCase'

const makeSolicitacao = (status = StatusSolicitacaoPatrimonio.PENDENTE): SolicitacaoPatrimonio =>
  new SolicitacaoPatrimonio({
    id: 'sol-1',
    tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO,
    patrimonioId: 'eq-1',
    associadoId: 'assoc-1',
    status,
    criadoEm: new Date(),
  })

const makeRepo = (): jest.Mocked<ISolicitacaoPatrimonioRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByAssociado: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
})

describe('RejeitarSolicitacaoUseCase', () => {
  let useCase: RejeitarSolicitacaoUseCase
  let repo: jest.Mocked<ISolicitacaoPatrimonioRepository>

  beforeEach(() => {
    repo = makeRepo()
    useCase = new RejeitarSolicitacaoUseCase(repo, { enviarParaAssociado: jest.fn() } as any)
  })

  it('rejeita solicitação PENDENTE com sucesso', async () => {
    repo.findById.mockResolvedValue(makeSolicitacao(StatusSolicitacaoPatrimonio.PENDENTE))
    repo.update.mockImplementation(async (s) => s)

    const result = await useCase.execute('sol-1')

    expect(result.status).toBe(StatusSolicitacaoPatrimonio.REJEITADA)
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ status: StatusSolicitacaoPatrimonio.REJEITADA }))
  })

  it('lança NotFoundException quando solicitação não existe', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando solicitação já está APROVADA', async () => {
    repo.findById.mockResolvedValue(makeSolicitacao(StatusSolicitacaoPatrimonio.APROVADA))

    await expect(useCase.execute('sol-1')).rejects.toThrow(BadRequestException)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('lança BadRequestException quando solicitação já está REJEITADA', async () => {
    repo.findById.mockResolvedValue(makeSolicitacao(StatusSolicitacaoPatrimonio.REJEITADA))

    await expect(useCase.execute('sol-1')).rejects.toThrow(BadRequestException)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('registra resolvidoEm ao rejeitar', async () => {
    repo.findById.mockResolvedValue(makeSolicitacao())
    repo.update.mockImplementation(async (s) => s)

    const result = await useCase.execute('sol-1')

    expect(result.resolvidoEm).toBeDefined()
  })
})
