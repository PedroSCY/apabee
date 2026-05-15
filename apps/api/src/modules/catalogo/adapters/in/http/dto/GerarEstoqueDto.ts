import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator'

export class GerarEstoqueDto {
  @ApiProperty({ example: 10, description: 'Quantidade de unidades a produzir' })
  @IsInt()
  @Min(1)
  quantidade!: number

  @ApiPropertyOptional({ description: 'UUID da campanha de origem da matéria-prima' })
  @IsOptional()
  @IsUUID()
  campanhaId?: string
}
