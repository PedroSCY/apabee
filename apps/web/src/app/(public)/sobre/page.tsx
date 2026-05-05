import Link from 'next/link'
import { Users, Leaf, Award, MapPin } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre — Apabee | APA',
  description: 'Conheça a Associação Pratense de Apicultura, sua história e missão.',
}

const VALORES = [
  {
    icon: Leaf,
    titulo: 'Sustentabilidade',
    texto: 'Produção responsável que respeita o meio ambiente e o ciclo natural das abelhas.',
  },
  {
    icon: Users,
    titulo: 'Cooperação',
    texto: 'Apicultores unidos para fortalecer a cadeia produtiva regional e o bem comum.',
  },
  {
    icon: Award,
    titulo: 'Qualidade',
    texto: 'Produtos sem aditivos, com rastreabilidade por lote e origem garantida.',
  },
]

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-5xl block">🐝</span>
        <h1 className="text-3xl sm:text-4xl font-bold">Sobre a APA</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A Associação Pratense de Apicultura reúne os apicultores de Prata e região para
          fortalecer a produção de mel e derivados com qualidade, transparência e cuidado.
        </p>
      </div>

      {/* História */}
      <section className="grid gap-8 sm:grid-cols-2 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Nossa História</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fundada por apicultores locais com o objetivo de organizar coletivamente a
            produção e comercialização de produtos apícolas, a APA nasceu da necessidade de
            unir forças em uma região com grande potencial para a apicultura.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Com o sistema Apabee, a associação digitaliza sua gestão — rastreando colheitas,
            lotes, estoque e distribuição de resultados de forma transparente para todos
            os associados.
          </p>
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-12">
          <span className="text-8xl">🍯</span>
        </div>
      </section>

      {/* Valores */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-center">Nossos Valores</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {VALORES.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-2xl border border-border bg-card p-6 space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{titulo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Localização */}
      <section className="rounded-2xl bg-secondary p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Onde estamos</h3>
          <p className="text-muted-foreground">
            Prata — Paraíba, Brasil. A APA atua na região do Cariri paraibano, área com
            florada rica e clima favorável à apicultura sustentável.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Quer fazer parte?</h2>
        <p className="text-muted-foreground">
          Entre em contato e saiba como se associar à APA.
        </p>
        <Link
          href="/contato"
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Entre em Contato
        </Link>
      </div>
    </div>
  )
}
