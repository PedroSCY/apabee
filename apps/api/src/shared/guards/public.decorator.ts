import { SetMetadata } from '@nestjs/common'

/** Metadata key usada pelo JwtAuthGuard para verificar se a rota é pública. */
export const IS_PUBLIC_KEY = 'isPublic'
/** Decorator que marca uma rota como pública, bypassando o JwtAuthGuard global. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
