import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'

@Catch()
/** Filtro global que captura exceções e retorna respostas HTTP padronizadas. */
export class GlobalExceptionFilter implements ExceptionFilter {
  /** Intercepta a exceção e monta resposta JSON com status, path e timestamp. */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const reply = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    if (!(exception instanceof HttpException)) {
      console.error('[GlobalExceptionFilter] Erro não tratado:', exception)
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno do servidor'

    const body =
      typeof message === 'string'
        ? { statusCode: status, error: message, path: request.url, timestamp: new Date().toISOString() }
        : { ...(message as object), path: request.url, timestamp: new Date().toISOString() }

    reply.status(status).send(body)
  }
}
