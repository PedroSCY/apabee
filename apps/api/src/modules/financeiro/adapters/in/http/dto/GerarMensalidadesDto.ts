import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator'

export class GerarMensalidadesDto {
  @ApiProperty({ example: 2025, description: 'Ano de competência (ex: 2025)' })
  @IsInt() @Min(2020) competenciaAno!: number

  @ApiProperty({ example: 5, description: 'Mês de competência (1–12)' })
  @IsInt() @Min(1) @Max(12) competenciaMes!: number

  @ApiPropertyOptional({ example: 50.0, description: 'Valor padrão da mensalidade em R$. Se omitido, usa o valor configurado em ConfiguracaoAssociacao.' })
  @IsNumber() @Min(0.01) @IsOptional() valorPadrao?: number
}
