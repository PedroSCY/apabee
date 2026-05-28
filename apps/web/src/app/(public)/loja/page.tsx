import type { Metadata } from 'next'
import type { ProdutoResponse } from '@/lib/api/catalogo'
import ConteudoPublico from '@/components/public/ConteudoPublico'
import { LojaGrid } from './_components/LojaGrid'

export const metadata: Metadata = {
  title: 'Loja — Apabee',
  description: 'Mel, própolis, cera e geleia real produzidos pelos apicultores da APA.',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getProdutos(): Promise<ProdutoResponse[]> {
  try {
    const res = await fetch(`${API_URL}/catalogo/produtos?publicos=true`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function LojaPage() {
  const produtos = await getProdutos()

  return (
    <ConteudoPublico className="py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-serif mb-2 text-accent">Loja</h1>
        <p className="text-muted-foreground">
          Produtos naturais da Associação Pratense de Apicultura
        </p>
      </div>
      <LojaGrid produtos={produtos} />
    </ConteudoPublico>
  )
}
