import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    usuarioId?: string
    acao: string
    recurso: string
    recursoId?: string
    ip?: string
  }): Promise<void> {
    await this.prisma.auditLog.create({ data: params }).catch(() => undefined)
  }
}
