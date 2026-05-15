import { IsNumber, IsPositive, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class DefinirPrecoSafraDto {
  @ApiProperty({ example: 'uuid-do-tipo' })
  @IsUUID()
  tipoMateriaPrimaId!: string

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @IsPositive()
  preco!: number
}
