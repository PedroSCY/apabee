import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
/** Módulo global que provê PrismaService para toda a aplicação. */
export class PrismaModule {}
