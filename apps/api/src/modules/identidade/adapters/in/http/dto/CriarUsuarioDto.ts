import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { RoleUsuario } from '@apa/shared'

export class CriarUsuarioDto {
  @IsString()
  @MinLength(2)
  nome!: string

  @IsEmail()
  email!: string

  @IsEnum(RoleUsuario)
  role!: RoleUsuario

  @IsOptional()
  @IsString()
  telefone?: string
}
