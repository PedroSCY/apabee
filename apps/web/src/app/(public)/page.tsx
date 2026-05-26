import Link from 'next/link'
import { Package, Leaf, Users, ShoppingBag, Hexagon, ArrowRight, ShieldCheck } from 'lucide-react'
import type { ProdutoResponse } from '@/lib/api/catalogo'
import Image from 'next/image'
import HeroHome from '@/assets/hero-apiary.jpg'
import ConteudoPublico from '@/components/public/ConteudoPublico'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getProdutosDestaque(): Promise<ProdutoResponse[]> {
  try {
    const res = await fetch(`${API_URL}/catalogo/produtos?publicos=true`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
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
      <div className="relative h-44 bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
        {produto.imagemUrl ? (
          <Image
            src={produto.imagemUrl}
            alt={produto.nome}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-amber-300" />
          </div>
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
    titulo: '100% Natural',
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
  {
    icon: ShieldCheck,
    titulo: 'Qualidade Certificada',
    texto: 'Controle rigoroso de origem, manejo e envase.',
  },
]

export default async function Home() {
  const produtos = await getProdutosDestaque()

  return (
    <>
      <section className="relative overflow-hidden">
        <Image
          src={HeroHome}
          alt="Apicultor segurando favo de mel dourado em apiário"
          fill
          priority
          className="object-cover"
          loading="eager"
        />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <ConteudoPublico className="relative z-10 flex min-h-[clamp(500px,70vh,760px)] flex-col justify-center py-24">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-background/90 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-accent shadow-soft">
            <Hexagon className="h-3.5 w-3.5 text-primary" /> Associação Pratense de Apicultura
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] text-white md:text-7xl">
            Mel puro, abelhas protegidas, apicultores valorizados.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            A Apabee reúne os apicultores de Prata e região para promover a apicultura sustentável,
            compartilhar conhecimento e levar até você produtos da colmeia da mais alta qualidade.
          </p>
          <div className="flex flex-wrap mt-8 gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link href="/loja">
                Conheça nossos produtos <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sobre">Conheça a APA</Link>
            </Button>
          </div>
        </ConteudoPublico>
      </section>

      {/* ─── Diferenciais ─────────────────────────────────────────────── */}
      <section className="bg-warm-gradient py-20">
        <ConteudoPublico>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {DIFERENCIAIS.map(({ icon: Icon, titulo, texto }) => (
              <div
                key={titulo}
                className=" rounded-2xl border border-border/60 bg-card p-7 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-soft flex flex-col "
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-honey-gradient shadow-soft">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="mt-5 text-2xl font-serif font-semibold text-accent">{titulo}</h3>
                  <p className="mt-2 text-muted-foreground">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </ConteudoPublico>
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

      {/* ─── CTA Final ────────────────────────────────────────────────── */}
      <section className="py-20 ">
        <ConteudoPublico>
          <div className="overflow-hidden rounded-3xl bg-honey-gradient p-10 shadow-glow md:p-16">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-serif text-4xl font-semibold text-primary-foreground md:text-5xl">
                  Faça parte da Apabee
                </h2>
                <p className="mt-4 text-primary-foreground/90">
                  Cursos, assistência técnica, compras coletivas e o apoio de uma rede inteira de apicultores.
                  Associe-se e fortaleça a apicultura pratense.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Button variant="accent" size="xl" asChild>
                  <Link href="/contato">Quero me associar</Link>
                </Button>
                <Button variant="outline" size="xl" asChild className='bg-background/90'>
                  <Link href="/associados">Já sou associado</Link>
                </Button>
              </div>
            </div>
          </div>
        </ConteudoPublico>
      </section>
    </>
  )
}
