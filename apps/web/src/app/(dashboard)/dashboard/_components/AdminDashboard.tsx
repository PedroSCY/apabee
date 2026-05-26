'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertCircle, ArrowRight, CheckCircle2, DollarSign,
  MessageSquare, ShoppingBag, TrendingUp, Users, Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAssociados } from '@/hooks/useAssociados'
import { useCampanhas } from '@/hooks/useCampanhas'
import { useDashboardFinanceiro, useMensalidades } from '@/hooks/useFinanceiro'
import { useAvisos, useSolicitacoesContato } from '@/hooks/useComunicacao'
import { useSolicitacoes } from '@/hooks/useSolicitacoes'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const now = new Date()

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmtK = (v: number) =>
  v >= 1000
    ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
    : v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

function barVisibility(index: number, total: number) {
  const fromEnd = total - 1 - index
  if (fromEnd >= 6) return 'hidden lg:flex'
  if (fromEnd >= 4) return 'hidden md:flex'
  return 'flex'
}

const CAT_AVISO: Record<string, { label: string; cn: string }> = {
  GERAL:      { label: 'Geral',      cn: 'bg-muted text-muted-foreground' },
  URGENTE:    { label: 'Urgente',    cn: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  REUNIAO:    { label: 'Reunião',    cn: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  FINANCEIRO: { label: 'Financeiro', cn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export function AdminDashboard() {
  const { data: associados = [], isLoading: loadAssoc } = useAssociados()
  const { data: campanhas = [] } = useCampanhas()
  const { data: dashboard, isLoading: loadDash } = useDashboardFinanceiro(now.getFullYear())
  const { data: mensalidades = [], isLoading: loadMens } = useMensalidades({
    ano: now.getFullYear(),
    mes: now.getMonth() + 1,
  })
  const { data: avisos = [] } = useAvisos(true)
  const { data: solicitacoesContato = [] } = useSolicitacoesContato()
  const { data: solicitacoesPatrimonio = [] } = useSolicitacoes('PENDENTE')

  // ── Contagens ──────────────────────────────────────────────────────────────
  const associadosAtivos   = associados.filter((a) => a.status === 'ATIVO').length
  const associadosPendentes = associados.filter((a) => a.status === 'PENDENTE')
  const totalCadastrados   = associados.length

  const mensalidadesPagas     = mensalidades.filter((m) => m.status === 'PAGO').length
  const mensalidadesPendentes = mensalidades.filter((m) => m.status === 'PENDENTE').length
  const mensalidadesIsentas   = mensalidades.filter((m) => m.status === 'ISENTO').length
  const totalMens = mensalidadesPagas + mensalidadesPendentes + mensalidadesIsentas
  const totalEmAberto = mensalidades.filter((m) => m.status === 'PENDENTE').reduce((s, m) => s + m.valor, 0)

  const solicitacoesContatoPendentes = solicitacoesContato.filter((s) => s.status === 'PENDENTE')

  // ── Gráfico mensal — só meses que já ocorreram ──────────────────────────────
  const grafico = (dashboard?.graficoMensal ?? []).filter((g) => g.mes <= now.getMonth())
  const maxBar  = Math.max(...grafico.map((g) => g.receita), 1)

  // ── "Receita por categoria" → adaptado para mensalidades do mês ────────────
  const catsMens = [
    { label: 'Pagas',     value: mensalidadesPagas,     total: totalMens },
    { label: 'Pendentes', value: mensalidadesPendentes, total: totalMens },
    { label: 'Isentas',   value: mensalidadesIsentas,   total: totalMens },
  ]

  // ── Avisos recentes ────────────────────────────────────────────────────────
  const avisosRecentes = [...avisos]
    .sort((a, b) => {
      if (a.fixado !== b.fixado) return a.fixado ? -1 : 1
      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    })
    .slice(0, 3)

  // ── Associados com pendências ──────────────────────────────────────────────
  const associadosInadimplentes = React.useMemo(() => {
    const porAssociado = mensalidades
      .filter((m) => m.status === 'PENDENTE')
      .reduce<Record<string, number>>((acc, m) => {
        acc[m.associadoId] = (acc[m.associadoId] ?? 0) + 1
        return acc
      }, {})
    return associados
      .filter((a) => a.status === 'ATIVO' && porAssociado[a.id])
      .map((a) => ({ ...a, pendencias: porAssociado[a.id] }))
      .sort((a, b) => b.pendencias - a.pendencias)
      .slice(0, 5)
  }, [associados, mensalidades])

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-serif text-3xl text-accent">Dashboard Administrativo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão consolidada da Apabee — finanças, associados e operação.
        </p>
      </div>

      {/* ── Alertas operacionais (3 cards) ──────────────────────────────────── */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              {loadAssoc
                ? <Skeleton className="h-4 w-40" />
                : <p className="text-sm font-medium">
                    {associadosPendentes.length} solicitaç{associadosPendentes.length === 1 ? 'ão' : 'ões'} de associação
                  </p>
              }
              <p className="text-xs text-muted-foreground">aguardando aprovação</p>
            </div>
            {associadosPendentes.length > 0 && (
              <Button size="sm" variant="ghost" asChild className="ml-auto shrink-0 h-7 px-2 text-xs">
                <Link href="/associados">Ver</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {solicitacoesPatrimonio.length} pedido{solicitacoesPatrimonio.length !== 1 ? 's' : ''} de uso
              </p>
              <p className="text-xs text-muted-foreground">de equipamentos</p>
            </div>
            {solicitacoesPatrimonio.length > 0 && (
              <Button size="sm" variant="ghost" asChild className="ml-auto shrink-0 h-7 px-2 text-xs">
                <Link href="/insumos">Ver</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              {loadAssoc
                ? <Skeleton className="h-4 w-36" />
                : <p className="text-sm font-medium">{associadosAtivos} associados ativos</p>
              }
              <p className="text-xs text-muted-foreground">de {totalCadastrados} cadastrados</p>
            </div>
            <Button size="sm" variant="ghost" asChild className="ml-auto shrink-0 h-7 px-2 text-xs">
              <Link href="/associados">Ver</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── KPIs financeiros (4 cards) ───────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Receita anual',          value: fmt(dashboard?.receitaYTD ?? 0),  icon: TrendingUp, accent: 'text-primary' },
          { label: 'Resultado líquido',       value: fmt(dashboard?.saldoLiquido ?? 0), icon: DollarSign, accent: 'text-accent'  },
          { label: 'Mensalidades em aberto',  value: fmt(totalEmAberto),                icon: ShoppingBag, accent: 'text-primary' },
          { label: 'Associados inadimplentes', value: dashboard?.inadimplentes ?? 0,    icon: Wallet,     accent: 'text-accent'  },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.accent}`} />
              </div>
              {loadDash || (s.label.includes('Mensalidades') && loadMens)
                ? <Skeleton className="mt-2 h-8 w-28" />
                : <p className="mt-2 font-serif text-2xl text-accent">{s.value}</p>
              }
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Gráficos ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Receita mensal — barras CSS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {loadDash ? (
              <div className="space-y-2">
                <div className="flex h-36 items-end gap-1.5">
                  {[30, 55, 40, 75, 60, 90, 50, 65].map((h, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-sm hidden md:block"
                      style={{ height: `${h}%` }} />
                  ))}
                  {[60, 90, 50, 65].map((h, i) => (
                    <Skeleton key={`sm-${i}`} className="flex-1 rounded-t-sm block md:hidden"
                      style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="flex-1 h-3" />)}
                </div>
              </div>
            ) : grafico.length === 0 ? (
              <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponível para {now.getFullYear()}.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex h-36 items-end gap-1.5">
                  {grafico.map((g, i) => (
                    <div key={g.mes} className={`${barVisibility(i, grafico.length)} flex-1 items-end h-full`}>
                      <div
                        className="w-full rounded-t-sm bg-honey-gradient transition-smooth"
                        style={{ height: `${Math.max((g.receita / maxBar) * 100, g.receita > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {grafico.map((g, i) => (
                    <div key={g.mes} className={`${barVisibility(i, grafico.length)} flex-1 flex-col items-center gap-0.5`}>
                      <span className="text-[10px] text-muted-foreground">{MESES[g.mes]}</span>
                      <span className="text-[10px] font-medium tabular-nums">{fmtK(g.receita)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mensalidades do mês — barras horizontais */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base capitalize">
                Mensalidades — {now.toLocaleString('pt-BR', { month: 'long' })}
              </CardTitle>
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <Link href="/financeiro">Ver <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadMens ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
            ) : totalMens === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma mensalidade gerada para este mês.</p>
            ) : (
              catsMens.map(({ label, value, total }) => {
                const pct = total > 0 ? (value / total) * 100 : 0
                return (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">{value} / {total} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-honey-gradient" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
            {totalEmAberto > 0 && !loadMens && (
              <p className="text-xs font-medium text-amber-600 pt-1">{fmt(totalEmAberto)} em aberto</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Associados com pendências ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Associados com mensalidades pendentes</CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <Link href="/associados">Ver todos <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadAssoc || loadMens ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : associadosInadimplentes.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Nenhum associado com mensalidades pendentes este mês.
            </div>
          ) : (
            associadosInadimplentes.map((a) => (
              <div key={a.id}
                className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{a.usuario.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    Membro desde {format(new Date(a.dataIngresso), 'MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <Badge variant="destructive" className="shrink-0 text-xs">
                  {a.pendencias} pendente{a.pendencias > 1 ? 's' : ''}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Solicitações de contato + Avisos ────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={solicitacoesContatoPendentes.length > 0 ? 'border-amber-300 dark:border-amber-800' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Solicitações de Contato</CardTitle>
                {solicitacoesContatoPendentes.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    {solicitacoesContatoPendentes.length} pendente{solicitacoesContatoPendentes.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <Link href="/comunicacao">Ver <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {solicitacoesContatoPendentes.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Nenhuma solicitação pendente.
              </div>
            ) : (
              <div className="space-y-2">
                {solicitacoesContatoPendentes.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {format(new Date(s.criadoEm), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                ))}
                {solicitacoesContatoPendentes.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    + {solicitacoesContatoPendentes.length - 4} mais
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Avisos publicados recentemente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {avisosRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aviso publicado.</p>
            ) : (
              avisosRecentes.map((a) => {
                const cat = CAT_AVISO[a.categoria] ?? CAT_AVISO.GERAL
                return (
                  <div key={a.id} className="rounded-md border border-border/60 bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-snug truncate">{a.titulo}</p>
                      <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.cn}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{a.conteudo}</p>
                  </div>
                )
              })
            )}
            <Button asChild size="sm" variant="ghost" className="w-full h-7 text-xs mt-1">
              <Link href="/comunicacao">Gerenciar avisos <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Campanhas recentes ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Campanhas recentes</CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <Link href="/campanhas">Ver todas <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {campanhas.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Nenhuma campanha cadastrada.</p>
          ) : (
            <div className="divide-y">
              {[...campanhas]
                .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
                .slice(0, 5)
                .map((c) => {
                  const STATUS: Record<string, { label: string; cn: string }> = {
                    PLANEJADA: { label: 'Planejada', cn: 'bg-slate-100 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300' },
                    ATIVA:     { label: 'Ativa',     cn: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
                    CONCLUIDA: { label: 'Concluída', cn: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-400' },
                    LIQUIDADA: { label: 'Liquidada', cn: 'bg-purple-100 text-purple-700 border-transparent dark:bg-purple-950 dark:text-purple-400' },
                    CANCELADA: { label: 'Cancelada', cn: 'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400' },
                  }
                  const TIPO: Record<string, { label: string; cn: string }> = {
                    PRODUCAO:  { label: 'Produção',  cn: 'bg-amber-100 text-amber-700 border-transparent' },
                    AQUISICAO: { label: 'Aquisição', cn: 'bg-sky-100 text-sky-700 border-transparent' },
                  }
                  const s = STATUS[c.status] ?? { label: c.status, cn: '' }
                  const t = TIPO[c.tipo]    ?? { label: c.tipo,   cn: '' }
                  return (
                    <Link key={c.id} href={`/campanhas/${c.id}`}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.codigo}</p>
                      </div>
                      <Badge variant="outline" className={`${t.cn} text-[10px] shrink-0`}>{t.label}</Badge>
                      <Badge variant="outline" className={`${s.cn} text-[10px] shrink-0`}>{s.label}</Badge>
                    </Link>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
