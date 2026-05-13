import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { RoleUsuario } from '@apa/shared'

/** DTO para atualização parcial de um usuário */
export class AtualizarUsuarioDto {
  /** Novo nome do usuário */
  @ApiPropertyOptional({ example: 'João da Silva' })
  @IsOptional()
  @IsString()
  nome?: string

  /** Novo e-mail do usuário */
  @ApiPropertyOptional({ example: 'joao@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  /** Nova role de acesso */
  @ApiPropertyOptional({ enum: RoleUsuario })
  @IsOptional()
  @IsEnum(RoleUsuario)
  role?: RoleUsuario
}
