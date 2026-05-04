import { IsString, IsOptional } from 'class-validator'

export class AtualizarConfiguracaoDto {
  @IsString() @IsOptional() nomeExibido?: string
  @IsString() @IsOptional() cnpj?: string
  @IsString() @IsOptional() email?: string
  @IsString() @IsOptional() telefone?: string
  @IsString() @IsOptional() endereco?: string
  @IsString() @IsOptional() corFundo?: string
  @IsString() @IsOptional() corTexto?: string
  @IsString() @IsOptional() corPrimaria?: string
  @IsString() @IsOptional() corPrimariaForeground?: string
  @IsString() @IsOptional() corSidebar?: string
  @IsString() @IsOptional() corAccent?: string
}
