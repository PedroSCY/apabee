import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import type { ProdutoResponse } from '@/lib/api/catalogo'
import { AddToCartButton } from './_components/AddToCartButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ProdutoDetalhe extends ProdutoResponse {
  estoque: { quantidadeDisponivel: number } | null
}

async function getProduto(slug: string): Promise<ProdutoDetalhe | null> {
  try {
    const listRes = await fetch(`${API_URL}/catalogo/produtos?publicos=true`, {
      next: { revalidate: 300 },
    })
    if (!listRes.ok) return null
    const lista: ProdutoResponse[] = await listRes.json()
    const produto = lista.find((p) => p.slug === slug)
    if (!produto) return null

    const detRes = await fetch(`${API_URL}/catalogo/produtos/${produto.id}`, {
      next: { revalidate: 300 },
    })
    if (!detRes.ok) return null
    return detRes.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const produto = await getProduto(slug)
  if (!produto) return { title: 'Produto não encontrado — Apabee' }
  return {
    title: `${produto.nome} — Apabee`,
    description: produto.descricao,
  }
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const produto = await getProduto(slug)

  if (!produto || produto.status !== 'PUBLICADO') notFound()

  const qtd = produto.estoque?.quantidadeDisponivel ?? 0
  const esgotado = qtd === 0

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <Link
        href="/loja"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à loja
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Imagem */}
        <div className="flex items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 aspect-square overflow-hidden">
          {produto.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-20 w-20 text-amber-300" />
          )}
        </div>

        {/* Detalhes */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-3">
              {produto.nome}
            </h1>
            <p className="text-muted-foreground leading-relaxed">{produto.descricao}</p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold text-primary">{fmt(produto.preco)}</p>
            {esgotado ? (
              <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                Sem estoque
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {qtd} em estoque
              </span>
            )}
          </div>

          <AddToCartButton produto={produto} esgotado={esgotado} />

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1.5">
            <p>🐝 Produzido pelos apicultores da APA — Prata, PB</p>
            <p>🌿 Produto natural sem aditivos artificiais</p>
            <p>📦 Retirada ou entrega combinada com a associação</p>
          </div>
        </div>
      </div>
    </div>
  )
}
