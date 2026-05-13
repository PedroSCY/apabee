import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { RoleUsuario } from '@apa/shared'

/** DTO para criação de um novo usuário */
export class CriarUsuarioDto {
  /** Nome completo do usuário */
  @ApiProperty({ example: 'João Silva', minLength: 2 })
  @IsString()
  @MinLength(2)
  nome!: string

  /** E-mail do usuário */
  @ApiProperty({ example: 'joao.silva@example.com' })
  @IsEmail()
  email!: string

  /** Role de acesso do usuário (ADMIN ou ASSOCIADO) */
  @ApiProperty({ enum: RoleUsuario, example: RoleUsuario.ASSOCIADO })
  @IsEnum(RoleUsuario)
  role!: RoleUsuario

  /** Telefone de contato (opcional) */
  @ApiPropertyOptional({ example: '83999990000' })
  @IsOptional()
  @IsString()
  telefone?: string

  /** Senha inicial. Se omitida, link de redefinição é enviado por e-mail */
  @ApiPropertyOptional({ description: 'Senha inicial. Se omitida, um link de redefinição é enviado por e-mail.' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  senha?: string
}
