import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator'

export class CriarAtaDto {
  @IsString() @IsNotEmpty()
  titulo!: string

  @IsString() @IsNotEmpty()
  conteudo!: string

  @IsDateString()
  dataReuniao!: string

  @IsBoolean() @IsOptional()
  publicada?: boolean

  @IsOptional() @IsArray() @IsUUID('4', { each: true })
  participantesIds?: string[]
}

export class AdicionarParticipanteDto {
  @IsString() @IsNotEmpty()
  associadoId!: string
}
