import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ConfirmarOrdemProducaoDto {
  @ApiProperty({ description: 'Quantidade real de unidades produzidas' })
  @IsInt()
  @Min(1)
  quantidadeReal!: number

  @ApiPropertyOptional({ description: 'Material físico recuperado e devolvido ao pool (kg/L)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sobrasRecuperadas?: number

  @ApiPropertyOptional({ description: 'Observação livre sobre a produção' })
  @IsOptional()
  @IsString()
  observacao?: string
}
