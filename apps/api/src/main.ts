import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter'

/** Inicializa a aplicação NestJS com CORS, Helmet, Swagger e ValidationPipe. */
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  const config = app.get(ConfigService)

  // CORS — lê origens permitidas do env para funcionar em dev e em prod
  const allowedOrigins = (config.get<string>('ALLOWED_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())

  await app.register(cors, {
    origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
      // Permite chamadas sem origin (ex: Swagger local, curl, Postman)
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        cb(null, true)
      } else {
        cb(new Error('CORS: origem não permitida'), false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  await app.register(helmet, { contentSecurityPolicy: false })

  app.useGlobalFilters(new GlobalExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Apabee API')
    .setDescription('API do sistema de gestão da Associação Pratense de Apicultura — Prata, PB')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const port = config.get<number>('PORT') ?? 3000
  await app.listen(port, '0.0.0.0')

  console.log(`\nAPI rodando em: http://localhost:${port}`)
  console.log(`Swagger disponível em: http://localhost:${port}/api/docs\n`)
  console.log(`CORS permitido para: ${allowedOrigins.join(', ')}\n`)
}

bootstrap()
