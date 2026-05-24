import { Controller, Get, Req, Res } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { FastifyReply, FastifyRequest } from 'fastify'
import { SseService } from './sse.service'

/** Stream de eventos em tempo real para o frontend via Server-Sent Events. */
@ApiExcludeController()
@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  /**
   * Abre o stream SSE compatível com Fastify via reply.raw.
   * Autenticação via query param `?token=<jwt>` (EventSource não suporta headers).
   * X-Accel-Buffering: no — desativa buffering do nginx em produção.
   */
  @Get('events')
  stream(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const raw = reply.raw

    // @fastify/cors seta headers no reply Fastify, não em reply.raw.
    // Como usamos reply.raw direto para SSE, precisamos propagar o CORS manualmente.
    const origin = (req.headers as Record<string, string>).origin
    if (origin) {
      raw.setHeader('Access-Control-Allow-Origin', origin)
      raw.setHeader('Access-Control-Allow-Credentials', 'true')
      raw.setHeader('Vary', 'Origin')
    }

    raw.setHeader('Content-Type', 'text/event-stream')
    raw.setHeader('Cache-Control', 'no-cache, no-transform')
    raw.setHeader('Connection', 'keep-alive')
    raw.setHeader('X-Accel-Buffering', 'no')
    raw.flushHeaders()

    const subscription = this.sseService.asObservable().subscribe({
      next: (event) => {
        raw.write(`data: ${JSON.stringify(event)}\n\n`)
      },
    })

    req.raw.on('close', () => subscription.unsubscribe())
  }
}
