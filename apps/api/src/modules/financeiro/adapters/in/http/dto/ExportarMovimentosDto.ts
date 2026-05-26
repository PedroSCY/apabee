import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator'
import { TipoMovimentoFinanceiro } from '@apa/shared'

export class ExportarMovimentosDto {
  @ApiProperty({ enum: ['pdf', 'csv'], example: 'pdf' })
  @IsIn(['pdf', 'csv']) formato!: 'pdf' | 'csv'

  @ApiPropertyOptional()
  @IsUUID() @IsOptional() associadoId?: string

  @ApiPropertyOptional({ enum: TipoMovimentoFinanceiro })
  @IsIn(Object.values(TipoMovimentoFinanceiro)) @IsOptional() tipo?: TipoMovimentoFinanceiro

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsDateString() @IsOptional() dataInicio?: string

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString() @IsOptional() dataFim?: string
}
