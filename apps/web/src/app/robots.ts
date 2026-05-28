import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Bloqueia rotas privadas (dashboard, auth, checkout)
        disallow: [
          '/associados',
          '/campanhas',
          '/financeiro',
          '/producao',
          '/produtos',
          '/safras',
          '/insumos',
          '/documentos',
          '/comunicacao',
          '/configuracoes',
          '/dashboard',
          '/gerenciar-loja',
          '/checkout',
          '/minha-conta',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.apabee.com.br/sitemap.xml',
    host: 'https://www.apabee.com.br',
  }
}
