import { IsNumber, IsUUID, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AlocarPoolParaCampanhaDto {
  @ApiProperty({ description: 'ID do tipo de matéria-prima a alocar' })
  @IsUUID()
  tipoMateriaPrimaId!: string

  @ApiProperty({ description: 'Quantidade a transferir do pool para a campanha (em kg/L)' })
  @IsNumber()
  @Min(0.001)
  quantidade!: number

  @ApiProperty({ description: 'Valor monetário (R$) da alocação — registrado como contribuição da associação' })
  @IsNumber()
  @Min(0.01)
  valorMonetario!: number
}
