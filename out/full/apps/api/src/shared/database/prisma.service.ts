import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

@Injectable()
/** Serviço Prisma com pool PostgreSQL adaptado para conexão assíncrona. */
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Injeta ConfigService e cria pool de conexão com o banco. */
  constructor(config: ConfigService) {
    const pool = new Pool({ connectionString: config.get<string>('DATABASE_URL') })
    const adapter = new PrismaPg(pool)
    super({ adapter })
  }

  /** Conecta ao banco quando o módulo é inicializado. */
  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  /** Desconecta do banco quando o módulo é destruído. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
