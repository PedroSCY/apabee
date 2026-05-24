import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { PrismaService } from '../database/prisma.service'

export const AUDIT_ACAO = 'audit:acao'
export const AUDIT_RECURSO = 'audit:recurso'

/** Decora um endpoint para registrar auditoria LGPD Art. 37. Uso: @Audit('CRIAR_ASSOCIADO', 'associado') */
export const Audit = (acao: string, recurso: string) =>
  (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_ACAO, acao, descriptor.value as object)
    Reflect.defineMetadata(AUDIT_RECURSO, recurso, descriptor.value as object)
    return descriptor
  }

/** Interceptor que grava AuditLog para endpoints marcados com @Audit(). */
@Injectable()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AuditInterceptor implements NestInterceptor<any, any> {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler<any>): any {
    const acao = this.reflector.get<string>(AUDIT_ACAO, context.getHandler())
    if (!acao) return next.handle()

    const recurso = this.reflector.get<string>(AUDIT_RECURSO, context.getHandler()) ?? ''
    const req = context.switchToHttp().getRequest<Request>()
    const usuarioId = (req.user as { sub?: string } | undefined)?.sub
    const ip = req.ip ?? req.socket.remoteAddress

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream$ = next.handle() as any
    return {
      subscribe: (observer: { next: (v: unknown) => void; error: (e: unknown) => void; complete: () => void }) => {
        return stream$.subscribe({
          next: (body: unknown) => {
            const recursoId =
              (body as Record<string, unknown> | null)?.['id'] as string | undefined ??
              (req.params as Record<string, string>)['id']
            this.prisma.auditLog.create({
              data: { usuarioId, acao, recurso, recursoId, ip },
            }).catch(() => undefined)
            observer.next(body)
          },
          error: (err: unknown) => observer.error(err),
          complete: () => observer.complete(),
        })
      },
    }
  }
}
