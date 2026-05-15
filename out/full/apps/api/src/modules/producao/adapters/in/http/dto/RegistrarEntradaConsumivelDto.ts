import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class RegistrarEntradaConsumivelDto {
  @ApiProperty({ example: 'uuid-do-tipo-materia-prima' })
  @IsUUID()
  tipoMateriaPrimaId!: string

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(1)
  quantidade!: number

  @ApiPropertyOptional({ example: 'compra-01-2025' })
  @IsOptional()
  @IsString()
  referenciaId?: string
}
