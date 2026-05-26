import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { CategoriaAviso, DestinatariosAviso } from '@apa/shared'

export class CriarAvisoDto {
  @ApiProperty({ example: 'Reunião ordinária — Junho 2025' })
  @IsString()
  @MinLength(3)
  titulo!: string

  @ApiProperty({ example: 'Informamos que a reunião acontecerá...' })
  @IsString()
  @MinLength(10)
  conteudo!: string

  @ApiProperty({ enum: CategoriaAviso, default: CategoriaAviso.GERAL })
  @IsEnum(CategoriaAviso)
  categoria!: CategoriaAviso

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fixado?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  publicado?: boolean

  @ApiPropertyOptional({ enum: DestinatariosAviso, default: DestinatariosAviso.TODOS })
  @IsOptional()
  @IsEnum(DestinatariosAviso)
  destinatarios?: DestinatariosAviso

  @ApiPropertyOptional({ default: false, description: 'Dispara e-mail para os destinatários ao publicar.' })
  @IsOptional()
  @IsBoolean()
  enviarEmail?: boolean

  @ApiPropertyOptional({ type: [String], description: 'IDs dos associados. Obrigatório quando destinatarios = SELECIONADOS.' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  selectedMemberIds?: string[]

  @ApiPropertyOptional({ description: 'Data da reunião (ISO 8601). Aplicável quando categoria = REUNIAO.' })
  @IsOptional()
  @IsISO8601()
  dataReuniao?: string

  @ApiPropertyOptional({ example: '19h', description: 'Horário da reunião. Aplicável quando categoria = REUNIAO.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  horarioReuniao?: string

  @ApiPropertyOptional({ example: 'Sede da associação', description: 'Local da reunião. Aplicável quando categoria = REUNIAO.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  localReuniao?: string
}
