import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CriarOrdemProducaoDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsUUID()
  produtoId!: string

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  quantidade!: number

  @ApiPropertyOptional({ example: 5, description: 'Percentual de perda esperada no processamento (ex.: 5 = 5%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perdaPercentual?: number
}
