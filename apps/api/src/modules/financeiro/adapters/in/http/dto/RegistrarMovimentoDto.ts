import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class RegistrarMovimentoDto {
  @ApiProperty({ example: 'uuid-do-associado' })
  @IsUUID() associadoId!: string

  @ApiPropertyOptional({ example: 'uuid-da-campanha' })
  @IsUUID() @IsOptional() campanhaId?: string

  @ApiProperty({ enum: ['ANTECIPACAO', 'CUSTO'], example: 'CUSTO' })
  @IsIn(['ANTECIPACAO', 'CUSTO']) tipo!: 'ANTECIPACAO' | 'CUSTO'

  @ApiProperty({ example: 50.0, description: 'Valor positivo em R$. CUSTO é salvo como negativo automaticamente.' })
  @IsNumber() @Min(0.01) valor!: number

  @ApiPropertyOptional({ example: 'Adiantamento referente à colheita de março' })
  @IsString() @IsOptional() descricao?: string

  @ApiPropertyOptional({ example: '2025-05-10', description: 'Data do movimento. Padrão: hoje.' })
  @IsDateString() @IsOptional() data?: string
}
