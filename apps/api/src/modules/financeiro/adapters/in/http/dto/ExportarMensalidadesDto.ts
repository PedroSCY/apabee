import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import { StatusMensalidade } from '@apa/shared'
import { Type } from 'class-transformer'

export class ExportarMensalidadesDto {
  @ApiProperty({ enum: ['pdf', 'csv'], example: 'pdf' })
  @IsIn(['pdf', 'csv']) formato!: 'pdf' | 'csv'

  @ApiPropertyOptional({ example: 2025 })
  @IsInt() @Min(2020) @IsOptional() @Type(() => Number) ano?: number

  @ApiPropertyOptional({ example: 5, description: '1–12' })
  @IsInt() @Min(1) @Max(12) @IsOptional() @Type(() => Number) mes?: number

  @ApiPropertyOptional({ enum: StatusMensalidade })
  @IsIn(Object.values(StatusMensalidade)) @IsOptional() status?: StatusMensalidade
}
