import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator'

export class CriarAtaDto {
  @ApiProperty({ example: 'Reunião Ordinária — Maio 2025', description: 'Título da ata' })
  @IsString() @IsNotEmpty()
  titulo!: string

  @ApiProperty({ example: 'Aos 10 de maio de 2025, reuniram-se os associados...', description: 'Conteúdo completo da ata' })
  @IsString() @IsNotEmpty()
  conteudo!: string

  @ApiProperty({ example: '2025-05-10', description: 'Data da reunião (ISO 8601)' })
  @IsDateString()
  dataReuniao!: string

  @ApiPropertyOptional({ example: false, description: 'Se true, publica imediatamente; caso contrário fica como rascunho' })
  @IsBoolean() @IsOptional()
  publicada?: boolean

  @ApiPropertyOptional({ example: ['550e8400-e29b-41d4-a716-446655440000'], description: 'UUIDs dos associados participantes' })
  @IsOptional() @IsArray() @IsUUID('4', { each: true })
  participantesIds?: string[]
}

export class AdicionarParticipanteDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID do associado a adicionar como participante' })
  @IsString() @IsNotEmpty()
  associadoId!: string
}
