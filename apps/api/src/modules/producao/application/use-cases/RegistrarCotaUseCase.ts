import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cota, ICampanhaRepository, ICotaRepository, IRegistrarCotaUseCase, RegistrarCotaInput } from '@apa/core'
import { OrigemContribuicao, StatusCampanha, TipoLote } from '@apa/shared'
import { randomUUID } from 'crypto'
import { CAMPANHA_REPOSITORY, COTA_REPOSITORY } from '../../producao.tokens'

@Injectable()
export class RegistrarCotaUseCase implements IRegistrarCotaUseCase {
  constructor(
    @Inject(CAMPANHA_REPOSITORY)
    private readonly campanhaRepo: ICampanhaRepository,
    @Inject(COTA_REPOSITORY)
    private readonly cotaRepo: ICotaRepository,
  ) {}

  async execute(input: RegistrarCotaInput): Promise<Cota> {
    const campanha = await this.campanhaRepo.findById(input.campanhaId)
    if (!campanha) throw new NotFoundException('Campanha não encontrada')
    if (campanha.tipo !== TipoLote.AQUISICAO)
      throw new BadRequestException('Cotas só são permitidas em campanhas de AQUISICAO')
    if (campanha.status !== StatusCampanha.ATIVA)
      throw new BadRequestException('Cotas só podem ser registradas em campanhas ATIVAS')
    if (input.valor <= 0)
      throw new BadRequestException('Valor da cota deve ser maior que zero')
    if (campanha.valorMinimo && input.valor < campanha.valorMinimo)
      throw new BadRequestException(`Valor mínimo da cota é R$ ${campanha.valorMinimo}`)
    if (campanha.valorMaximo && input.valor > campanha.valorMaximo)
      throw new BadRequestException(`Valor máximo da cota é R$ ${campanha.valorMaximo}`)

    const origem = input.associadoId ? OrigemContribuicao.ASSOCIADO : OrigemContribuicao.RECURSO_PROPRIO
    const cota = new Cota({
      id: randomUUID(),
      campanhaId: input.campanhaId,
      associadoId: input.associadoId,
      origem,
      valor: input.valor,
      data: new Date(),
      pago: false,
    })
    return this.cotaRepo.save(cota)
  }
}
