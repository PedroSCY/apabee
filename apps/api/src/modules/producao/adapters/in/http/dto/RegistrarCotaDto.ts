import { IsNumber, IsPositive, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegistrarCotaDto {
  @ApiProperty({ example: 'uuid-do-associado' })
  @IsUUID()
  associadoId!: string

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsPositive()
  valor!: number
}
