import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from '@fastify/helmet'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  await app.register(helmet, { contentSecurityPolicy: false })

  app.useGlobalFilters(new GlobalExceptionFilter())

  const config = app.get(ConfigService)

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
}

bootstrap()
