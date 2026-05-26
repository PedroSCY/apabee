'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  Boxes, CalendarDays, FlaskConical, Megaphone, Scale,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { useAtribuicoesPorAssociado } from '@/hooks/useAtribuicoes'
import { useColheitasPorAssociado } from '@/hooks/useProducao'
import { useCampanhas } from '@/hooks/useCampanhas'
import { useMeusMovimentos, useMinhasMensalidades } from '@/hooks/useFinanceiro'
import { useAvisos } from '@/hooks/useComunicacao'
import type { AvisoResponse } from '@/lib/api/comunicacao'
import type { TipoMovimento } from '@/lib/api/financeiro'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const now = new Date()
const anoAtual = now.getFullYear()

// ─── Mapeamento de estilos ────────────────────────────────────────────────────

const STATUS_CAMPANHA: Record<string, { label: string; cn: string }> = {
  PLANEJADA: { label: 'Planejada', cn: 'bg-slate-100 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300' },
  ATIVA:     { label: 'Ativa',     cn: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  CONCLUIDA: { label: 'Concluída', cn: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400' },
  LIQUIDADA: { label: 'Liquidada', cn: 'bg-purple-100 text-purple-700 border-transparent dark:bg-purple-950 dark:text-purple-400' },
  CANCELADA: { label: 'Cancelada', cn: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400' },
}

const TIPO_MOVIMENTO: Record<TipoMovimento, { label: string; cor: string }> = {
  MENSALIDADE:  { label: 'Mensalidade',  cor: 'text-emerald-600' },
  ANTECIPACAO:  { label: 'Antecipação',  cor: 'text-amber-600'   },
  RATEIO_FINAL: { label: 'Rateio Final', cor: 'text-blue-600'    },
  CUSTO:        { label: 'Custo',        cor: 'text-red-500'     },
}

// Tipo de ícone por categoria de aviso — segue o mapeamento do protótipo
function avisoIconConfig(categoria: string): {
  Icon: React.ElementType
  style: string
} {
  switch (categoria) {
    case 'REUNIAO':
      return { Icon: CalendarDays, style: 'bg-primary/10 text-primary' }
    case 'URGENTE':
      return { Icon: AlertTriangle, style: 'bg-destructive/10 text-destructive' }
    default:
      return { Icon: Megaphone, style: 'bg-accent/10 text-accent' }
  }
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, loading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  loading?: boolean
}) {
  return (
    <Card className="border-border/60 shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-honey-gradient text-primary-foreground shadow-glow">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {loading
            ? <Skeleton className="mt-1 h-6 w-16" />
            : <p className="text-xl font-semibold text-accent">{value}</p>
          }
        </div>
      </CardContent>
    </Card>
  )
}

function AvisoItem({ aviso }: { aviso: AvisoResponse }) {
  const { Icon, style } = avisoIconConfig(aviso.categoria)
  return (
    <div className="flex gap-3 rounded-lg border border-border/60 bg-card p-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm leading-snug">{aviso.titulo}</h3>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {format(new Date(aviso.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{aviso.conteudo}</p>
        {aviso.dataReuniao && (
          <p className="mt-1 text-xs text-primary font-medium">
            {format(new Date(aviso.dataReuniao), "dd 'de' MMMM", { locale: ptBR })}
            {aviso.horarioReuniao && ` · ${aviso.horarioReuniao}`}
            {aviso.localReuniao && ` · ${aviso.localReuniao}`}
          </p>
        )}
      </div>
    </div>
  )
}

function ProximaReuniaoCard({ avisos }: { avisos: AvisoResponse[] }) {
  const proxima = avisos
    .filter((a) => a.categoria === 'REUNIAO' && a.dataReuniao && new Date(a.dataReuniao) >= new Date())
    .sort((a, b) => new Date(a.dataReuniao!).getTime() - new Date(b.dataReuniao!).getTime())[0]

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl text-accent">Próxima reunião</CardTitle>
      </CardHeader>
      <CardContent>
        {!proxima ? (
          <div className="rounded-xl bg-warm-gradient p-5 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma reunião agendada.</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-warm-gradient p-5 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{proxima.titulo}</p>
              <p className="font-serif text-2xl font-semibold text-accent">
                {format(new Date(proxima.dataReuniao!), "dd 'de' MMMM", { locale: ptBR })}
              </p>
              {(proxima.horarioReuniao || proxima.localReuniao) && (
                <p className="text-sm text-muted-foreground">
                  {[proxima.horarioReuniao, proxima.localReuniao].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            {proxima.conteudo && (
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-foreground">Pauta resumida</p>
                <p className="text-muted-foreground leading-relaxed">{proxima.conteudo}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export function AssociadoDashboard() {
  const { data: meuPerfil, isLoading: loadingPerfil } = useMeuPerfil()
  const meuId = meuPerfil?.id ?? ''

  const { data: atribuicoes = [], isLoading: loadingAtrib } = useAtribuicoesPorAssociado(meuId)
  const { data: colheitas = [], isLoading: loadingColheitas } = useColheitasPorAssociado(meuId)
  const { data: mensalidades = [] } = useMinhasMensalidades()
  const { data: movimentos = [], isLoading: loadMovimentos } = useMeusMovimentos()
  const { data: campanhas = [], isLoading: loadCamp } = useCampanhas()
  const { data: avisos = [] } = useAvisos(true)

  const emprestimosAtivos = atribuicoes.filter((a) => a.status === 'ATIVO').length
  const colheitasAno = colheitas.filter((c) => new Date(c.dataColheita).getFullYear() === anoAtual)
  const volumeTotal = colheitasAno.reduce((s, c) => s + c.volume, 0)
  const volumeLabel = `${volumeTotal.toLocaleString('pt-BR')} kg`

  const campanhasAtivas = campanhas.filter((c) => c.status === 'ATIVA')

  const receitaEstimada = movimentos
    .filter((m) => m.tipo === 'RATEIO_FINAL' && m.valor > 0)
    .reduce((s, m) => s + m.valor, 0)

  const mensalidadesPendentes = mensalidades.filter((m) => m.status === 'PENDENTE')
  const mensalidadesPagas = mensalidades.filter((m) => m.status === 'PAGO').length
  const mensalidadesIsentas = mensalidades.filter((m) => m.status === 'ISENTO').length
  const totalMens = mensalidadesPagas + mensalidadesPendentes.length + mensalidadesIsentas

  const ultimosMovimentos = [...movimentos]
    .sort((a, b) => new Date(b.data as unknown as string).getTime() - new Date(a.data as unknown as string).getTime())
    .slice(0, 4)

  const avisosRecentes = [...avisos]
    .sort((a, b) => {
      if (a.fixado !== b.fixado) return a.fixado ? -1 : 1
      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    })
    .slice(0, 3)

  const loading = loadingPerfil || loadingAtrib

  return (
    <div className="space-y-6">

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Equipamentos em uso"   value={emprestimosAtivos}  icon={Boxes}       loading={loading} />
        <StatCard title="Campanhas em aberto"   value={campanhasAtivas.length} icon={FlaskConical} loading={loadCamp && !campanhas.length} />
        <StatCard title="Contribuição no ano"   value={loadingColheitas ? '…' : volumeLabel}  icon={Scale}  />
        <StatCard title="Receita estimada"      value={fmt(receitaEstimada)} icon={Wallet} loading={loadMovimentos && !movimentos.length} />
      </div>

      {/* ── Alerta mensalidades pendentes ─────────────────────────────────── */}
      {mensalidadesPendentes.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                  {mensalidadesPendentes.length === 1
                    ? 'Você tem 1 mensalidade em aberto'
                    : `Você tem ${mensalidadesPendentes.length} mensalidades em aberto`}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Entre em contato com a associação para regularizar sua situação.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="shrink-0 border-amber-300 dark:border-amber-700">
              <Link href="/financeiro">Ver detalhes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Avisos (2/3) + Próxima reunião (1/3) ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-accent">Avisos &amp; comunicados</CardTitle>
            <p className="text-sm text-muted-foreground">Acompanhe as últimas notícias da associação.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {avisosRecentes.length === 0
              ? <p className="text-sm text-muted-foreground">Nenhum aviso publicado no momento.</p>
              : avisosRecentes.map((a) => <AvisoItem key={a.id} aviso={a} />)
            }
          </CardContent>
        </Card>

        <ProximaReuniaoCard avisos={avisos} />
      </div>

      {/* ── Campanhas ativas + Últimos movimentos ─────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <Link href="/campanhas">Ver todas <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadCamp ? (
              <div className="space-y-2 p-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : campanhasAtivas.length === 0 ? (
              <EmptyState title="Nenhuma campanha ativa" description="Não há campanhas em andamento." className="py-8" />
            ) : (
              <div className="divide-y">
                {campanhasAtivas.slice(0, 4).map((c) => {
                  const s = STATUS_CAMPANHA[c.status] ?? { label: c.status, cn: '' }
                  return (
                    <Link key={c.id} href={`/campanhas/${c.id}`}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.codigo}</p>
                      </div>
                      <Badge variant="outline" className={`${s.cn} text-[10px] shrink-0`}>{s.label}</Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Últimos Movimentos</CardTitle>
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <Link href="/financeiro">Ver todos <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadMovimentos ? (
              <div className="space-y-2 p-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : ultimosMovimentos.length === 0 ? (
              <EmptyState title="Nenhum movimento" description="Seu histórico financeiro aparecerá aqui." className="py-8" />
            ) : (
              <div className="divide-y">
                {ultimosMovimentos.map((m) => {
                  const cfg = TIPO_MOVIMENTO[m.tipo as TipoMovimento] ?? { label: m.tipo, cor: 'text-foreground' }
                  const isPositivo = m.valor >= 0
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${cfg.cor}`}>{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(m.data as unknown as string), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <span className={`flex items-center gap-0.5 text-sm font-semibold tabular-nums ${
                        isPositivo ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {isPositivo ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {fmt(Math.abs(m.valor))}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Mensalidades do ano ────────────────────────────────────────────── */}
      {totalMens > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium capitalize">
                Minhas Mensalidades — {now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <Link href="/financeiro">Ver <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Pagas',     count: mensalidadesPagas,            color: 'bg-emerald-500', text: 'text-emerald-600' },
                { label: 'Pendentes', count: mensalidadesPendentes.length, color: 'bg-amber-400',   text: 'text-amber-600' },
                { label: 'Isentas',   count: mensalidadesIsentas,          color: 'bg-blue-400',    text: 'text-blue-600' },
              ].map(({ label, count, color, text }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-medium ${text}`}>{count} / {totalMens}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${(count / totalMens) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
