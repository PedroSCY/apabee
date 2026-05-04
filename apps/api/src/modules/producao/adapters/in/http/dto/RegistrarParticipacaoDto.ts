import { IsNumber, IsOptional, IsPositive, IsUUID, Max, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegistrarParticipacaoDto {
  @ApiProperty()
  @IsUUID()
  associadoId!: string

  @ApiProperty({ example: 30.5, description: 'Percentual de 0 a 100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentual!: number

  @ApiPropertyOptional({ example: 12.5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  volume?: number

  @ApiPropertyOptional({ example: 500.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorInvestido?: number
}
