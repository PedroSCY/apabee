import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CriarMetaProducaoDto {
  @ApiProperty({ description: 'UUID do produto a produzir' })
  @IsUUID()
  produtoId!: string

  @ApiProperty({ description: 'Quantidade planejada (unidades inteiras)' })
  @IsInt()
  @Min(1)
  quantidadePlanejada!: number

  @ApiPropertyOptional({ description: 'Perda percentual estimada no processamento (padrão: 5%)', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perdaPercentualEstimada?: number
}
