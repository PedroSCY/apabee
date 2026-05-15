import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

/** DTO para redefinição de senha de um usuário */
export class AtualizarSenhaDto {
  /** Nova senha (mínimo 8 caracteres) */
  @ApiProperty({ example: 'NovaSenha@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string
}
