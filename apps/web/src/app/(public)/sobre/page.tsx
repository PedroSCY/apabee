import Link from 'next/link'
import { Users, Leaf, Award, MapPin, Hexagon } from 'lucide-react'
import type { Metadata } from 'next'
import ConteudoPublico from '@/components/public/ConteudoPublico'
import { Button } from '@/components/ui/button'

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
    <>
      {/* Header */}
      <section className="bg-warm-gradient py-20">
        <ConteudoPublico className="max-w-6xl">
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
            <Hexagon className="h-4 w-4" /> Quem somos
          </span>
          <h1 className="mt-3 font-serif text-5xl font-semibold text-accent md:text-6xl">
            A voz dos apicultores de Prata.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A Associação Pratense de Apicultura — APA — nasceu da união de apicultores que acreditam
            no poder das abelhas para transformar comunidades, preservar o meio ambiente e gerar
            renda com produtos puros e de origem certificada.
          </p>
        </ConteudoPublico>
      </section>

      <section className="py-20">
        <ConteudoPublico className="grid max-w-7xl gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
            <h2 className="font-serif text-3xl font-semibold text-accent">Missão</h2>
            <p className="mt-3 text-muted-foreground">
              Promover a apicultura sustentável em Prata e região, capacitando associados e
              oferecendo produtos da colmeia da mais alta qualidade.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
            <h2 className="font-serif text-3xl font-semibold text-accent">Visão</h2>
            <p className="mt-3 text-muted-foreground">
              Ser referência em apicultura no Cariri Paraibano, reconhecida pela qualidade dos
              produtos e pelo cuidado com as abelhas.
            </p>
          </div>
        </ConteudoPublico>
      </section>

      {/* História */}
      <section>
        <ConteudoPublico className="max-w-6xl">
          <div className="grid md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
                <Hexagon className="h-4 w-4" /> Nossa História
              </span>
              <p className="text-muted-foreground leading-relaxed text-justify">
                Fundada por apicultores locais com o objetivo de organizar coletivamente a produção
                e comercialização de produtos apícolas, a APA nasceu da necessidade de unir forças
                em uma região com grande potencial para a apicultura.
              </p>
              <p className="text-muted-foreground leading-relaxed text-justify">
                Com o sistema Apabee, a associação digitaliza sua gestão — rastreando colheitas,
                lotes, estoque e distribuição de resultados de forma transparente para todos os
                associados.
              </p>
            </div>
            <div className="hidden md:inline-flex items-center justify-center rounded-2xl bg-honey-600 mx-20 gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-honey-gradient shadow-soft">
                <Hexagon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <p className="font-serif text-3xl font-semibold text-white">Apabee</p>
              </div>
            </div>
          </div>
        </ConteudoPublico>
      </section>

      {/* Valores */}
      <section className="py-20 bg-warm-gradient">
        <ConteudoPublico className="max-w-7xl">
          <h2 className="text-4xl font-serif font-bold text-center text-accent">Nossos Valores</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {VALORES.map(({ icon: Icon, titulo, texto }) => (
              <div
                key={titulo}
                className="rounded-2xl border border-border/60 bg-card p-7 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-soft flex flex-col"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-honey-gradient shadow-soft">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-2xl font-serif font-semibold text-accent">{titulo}</h3>
                <p className="mt-2 text-muted-foreground">{texto}</p>
              </div>
            ))}
          </div>
        </ConteudoPublico>
      </section>

      <section className="bg-warm-200 pb-15">
        <ConteudoPublico className="max-w-6xl">
          <div className="flex flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
              <Hexagon className="h-4 w-4" /> Quer fazer parte?
            </span>
            <div className="flex w-fit items-center overflow-hidden rounded-3xl bg-honey-gradient shadow-glow p-4 gap-2">
              <p className="text-primary-foreground ">
                Entre em contato e saiba como se associar à APA.
              </p>
              <Button variant="secondary" size="lg" >
                <Link href="/contato">Entre em Contato</Link>
              </Button>
            </div>
          </div>
        </ConteudoPublico>
      </section>

      {/* Localização */}
      <section className="bg-secondary p-8">
        <ConteudoPublico className="max-w-7xl">
          <div className=" flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg text-accent mb-1">Onde estamos</h3>
              <p className="text-muted-foreground">
                Prata — Paraíba, Brasil. A APA atua na região do Cariri paraibano, área com florada
                rica e clima favorável à apicultura sustentável.
              </p>
            </div>
          </div>
        </ConteudoPublico>
      </section>
    </>
  )
}
