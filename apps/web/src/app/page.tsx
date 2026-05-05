import Link from 'next/link'
import { Package, Leaf, Users, ShoppingBag } from 'lucide-react'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { CartDrawer } from '@/components/public/CartDrawer'
import type { ProdutoResponse } from '@/lib/api/catalogo'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getProdutosDestaque(): Promise<ProdutoResponse[]> {
  try {
    const res = await fetch(`${API_URL}/catalogo/produtos?publicos=true`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data: ProdutoResponse[] = await res.json()
    return data.slice(0, 4)
  } catch {
    return []
  }
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ProdutoCard({ produto }: { produto: ProdutoResponse }) {
  return (
    <Link
      href={`/loja/${produto.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex h-44 items-center justify-center bg-amber-50 dark:bg-amber-950/20">
        {produto.imagemUrl ? (
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-amber-300" />
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
          {produto.nome}
        </p>
        {produto.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2">{produto.descricao}</p>
        )}
        <p className="mt-auto pt-2 text-base font-bold text-primary">{fmt(produto.preco)}</p>
      </div>
    </Link>
  )
}

const DIFERENCIAIS = [
  {
    icon: Leaf,
    titulo: 'Produto Natural',
    texto: 'Mel puro, própolis, cera e geleia real produzidos sem aditivos artificiais.',
  },
  {
    icon: Users,
    titulo: 'Apicultores Locais',
    texto: 'Cada pote representa o trabalho de apicultores de Prata e região reunidos na APA.',
  },
  {
    icon: ShoppingBag,
    titulo: 'Comércio Justo',
    texto: 'Comprar da APA é apoiar diretamente quem produz, com rastreabilidade total do lote.',
  },
]

export default async function Home() {
  const produtos = await getProdutosDestaque()

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* ─── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-linear-to-br from-amber-50 via-background to-amber-50/40 dark:from-amber-950/30 dark:via-background dark:to-amber-950/10">
          <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
            <div className="absolute top-8 right-12 text-[180px] leading-none">🐝</div>
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24 sm:py-32 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-6">
              Associação Pratense de Apicultura — Prata, PB
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Mel puro da{' '}
              <span className="text-primary">natureza</span>{' '}
              para a sua mesa
            </h1>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
              A APA reúne os apicultores de Prata e região. Conheça nossos méis, própolis, cera e geleia real produzidos com qualidade e cuidado.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                Ver Loja
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Conheça a APA
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Produtos em destaque ─────────────────────────────────────── */}
        {produtos.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Nossos Produtos</h2>
                <p className="text-muted-foreground mt-1">
                  Qualidade direta dos apicultores para você
                </p>
              </div>
              <Link
                href="/loja"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {produtos.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Diferenciais ─────────────────────────────────────────────── */}
        <section className="bg-secondary">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Por que escolher a APA?
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {DIFERENCIAIS.map(({ icon: Icon, titulo, texto }) => (
                <div key={titulo} className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2">{titulo}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Final ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
          <div className="rounded-3xl bg-linear-to-br from-primary/10 to-amber-50 dark:to-amber-950/20 p-10 sm:p-16">
            <span className="text-5xl mb-5 block">🍯</span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Faça parte da comunidade
            </h2>
            <p className="max-w-md mx-auto text-muted-foreground mb-8 leading-relaxed">
              A APA é uma associação de apicultores comprometidos com a produção sustentável e o fortalecimento da apicultura no sertão paraibano.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Entre em Contato
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Saiba Mais
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
      <CartDrawer />
    </div>
  )
}
