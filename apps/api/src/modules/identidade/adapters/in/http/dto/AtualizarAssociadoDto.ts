import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { StatusAssociado } from '@apa/shared'

/** DTO para atualização parcial de um associado */
export class AtualizarAssociadoDto {
  /** Novo status do associado */
  @ApiPropertyOptional({ enum: StatusAssociado })
  @IsOptional()
  @IsEnum(StatusAssociado)
  status?: StatusAssociado

  /** Nova data de ingresso (ISO 8601) */
  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  dataIngresso?: string

  /** CPF do associado (somente dígitos) */
  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  cpf?: string

  /** Novas observações */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string
}
