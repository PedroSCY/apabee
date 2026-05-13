import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

/** DTO para auto-cadastro de associado com status pendente */
export class CriarAssociadoPendenteDto {
  /** Nome completo */
  @ApiProperty({ example: 'João Silva', minLength: 2 })
  @IsString()
  @MinLength(2)
  nome!: string

  /** E-mail do solicitante */
  @ApiProperty({ example: 'joao.silva@example.com' })
  @IsEmail()
  email!: string

  /** Telefone de contato (opcional) */
  @ApiPropertyOptional({ example: '83999990000' })
  @IsOptional()
  @IsString()
  telefone?: string

  /** Observações da solicitação */
  @ApiPropertyOptional({ example: 'Indicado por Maria.' })
  @IsOptional()
  @IsString()
  observacoes?: string
}
