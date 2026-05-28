import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.apabee.com.br'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ProdutoSitemapItem {
  slug: string
  criadoEm?: string
}

async function getProdutosPublicos(): Promise<ProdutoSitemapItem[]> {
  try {
    const res = await fetch(`${API_URL}/catalogo/produtos?publicos=true`, {
      next: { revalidate: 3600 }, // Revalida a cada 1h
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const produtos = await res.json()
    return produtos as ProdutoSitemapItem[]
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await getProdutosPublicos()

  const paginasEstaticas: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/loja`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const paginasProdutos: MetadataRoute.Sitemap = produtos
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE_URL}/loja/${p.slug}`,
      lastModified: p.criadoEm ? new Date(p.criadoEm) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...paginasEstaticas, ...paginasProdutos]
}
