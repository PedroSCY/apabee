import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class CriarAtaDto {
  @IsString() @IsNotEmpty()
  titulo!: string

  @IsString() @IsNotEmpty()
  conteudo!: string

  @IsDateString()
  dataReuniao!: string

  @IsBoolean() @IsOptional()
  publicada?: boolean
}

export class AdicionarParticipanteDto {
  @IsString() @IsNotEmpty()
  associadoId!: string
}
