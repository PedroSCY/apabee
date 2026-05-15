import Link from 'next/link'
import { Package } from 'lucide-react'
import type { Metadata } from 'next'
import type { ProdutoResponse } from '@/lib/api/catalogo'
import ConteudoPublico from '@/components/public/ConteudoPublico'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loja — Apabee',
  description: 'Mel, própolis, cera e geleia real produzidos pelos apicultores da APA.',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getProdutos(): Promise<ProdutoResponse[]> {
  try {
    const res = await fetch(`${API_URL}/catalogo/produtos?publicos=true`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function EstoqueLabel({ qtd }: { qtd: number }) {
  if (qtd === 0) return <span className="text-xs font-medium text-red-500">Sem estoque</span>
  if (qtd <= 5) return <span className="text-xs font-medium text-amber-600">{qtd} em estoque</span>
  return <span className="text-xs font-medium text-emerald-600">{qtd} em estoque</span>
}

export default async function LojaPage() {
  const produtos = await getProdutos()

  return (
    <ConteudoPublico className='py-12'>
      <div>
        {/* Header da página */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-serif mb-2 text-accent">Loja</h1>
          <p className="text-muted-foreground">
            Produtos naturais da Associação Pratense de Apicultura
          </p>
        </div>

        {/* Grid */}
        {produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-base font-medium">Nenhum produto disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              Volte em breve — novos lotes em preparação.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p) => (
              <Link
                key={p.id}
                href={`/loja/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex h-44 items-center justify-center bg-amber-50 dark:bg-amber-950/20">
                  {p.imagemUrl ? (
                    <Image src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-10 w-10 text-amber-300" />
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4 gap-1.5">
                  <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                    {p.nome}
                  </p>
                  {p.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>
                  )}
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <p className="text-base font-bold text-primary">{fmt(p.preco)}</p>
                    <EstoqueLabel qtd={p.quantidadeEstoque} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ConteudoPublico>
  )
}
