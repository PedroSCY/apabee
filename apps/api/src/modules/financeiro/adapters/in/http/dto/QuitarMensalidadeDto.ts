import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { MetodoPagamentoMensalidade } from '@apa/shared'

const metodosAceitos = [MetodoPagamentoMensalidade.PRESENCIAL, MetodoPagamentoMensalidade.TRANSFERENCIA]

export class QuitarMensalidadeDto {
  @ApiProperty({
    enum: metodosAceitos,
    example: MetodoPagamentoMensalidade.PRESENCIAL,
    description: 'Método de pagamento manual. Use ONLINE apenas via webhook Asaas.',
  })
  @IsEnum(metodosAceitos, { message: 'Método de pagamento inválido. Use PRESENCIAL ou TRANSFERENCIA.' })
  metodoPagamento!: MetodoPagamentoMensalidade
}
