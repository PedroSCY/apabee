'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHLY = [
  { mes: 'Jan', receita: 1200, despesa: 780 },
  { mes: 'Fev', receita: 1850, despesa: 920 },
  { mes: 'Mar', receita: 1400, despesa: 840 },
  { mes: 'Abr', receita: 2100, despesa: 1050 },
  { mes: 'Mai', receita: 1750, despesa: 970 },
  { mes: 'Jun', receita: 2300, despesa: 1100 },
]

const MOVIMENTOS = [
  { id: '1', descricao: 'Venda individual — Mel Silvestre 500g', tipo: 'RECEITA', valor: 45.0, data: '02/06/2025', status: 'CONFIRMADO' },
  { id: '2', descricao: 'Reembolso de insumos — Associado João', tipo: 'RECEITA', valor: 120.0, data: '28/05/2025', status: 'CONFIRMADO' },
  { id: '3', descricao: 'Compra de caixas e frames', tipo: 'DESPESA', valor: 380.0, data: '25/05/2025', status: 'CONFIRMADO' },
  { id: '4', descricao: 'Antecipação — Pedro Alves (Lote Mai/25)', tipo: 'ANTECIPACAO', valor: 320.0, data: '20/05/2025', status: 'CONFIRMADO' },
  { id: '5', descricao: 'Venda individual — Própolis 30ml', tipo: 'RECEITA', valor: 35.0, data: '18/05/2025', status: 'CONFIRMADO' },
  { id: '6', descricao: 'Repasse associado — Maria Santos', tipo: 'REPASSE', valor: 180.5, data: '15/05/2025', status: 'PENDENTE' },
  { id: '7', descricao: 'Aquisição de mel — Fornecedor XP', tipo: 'DESPESA', valor: 700.0, data: '10/05/2025', status: 'CONFIRMADO' },
]

type TipoFiltro = 'TODOS' | 'RECEITA' | 'DESPESA' | 'ANTECIPACAO' | 'REPASSE'
const FILTROS: { label: string; value: TipoFiltro }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Receitas', value: 'RECEITA' },
  { label: 'Despesas', value: 'DESPESA' },
  { label: 'Antecipações', value: 'ANTECIPACAO' },
  { label: 'Repasses', value: 'REPASSE' },
]

const TIPO_STYLE: Record<string, { label: string; color: string }> = {
  RECEITA:      { label: 'Receita',      color: 'text-emerald-600' },
  DESPESA:      { label: 'Despesa',      color: 'text-red-500' },
  ANTECIPACAO:  { label: 'Antecipação',  color: 'text-amber-600' },
  REPASSE:      { label: 'Repasse',      color: 'text-blue-600' },
}

function KpiCard({ title, value, icon: Icon, trend, sub }: {
  title: string
  value: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  sub?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function FinanceiroAdmin() {
  const [filtro, setFiltro] = React.useState<TipoFiltro>('TODOS')

  const totalReceita = MONTHLY.reduce((s, d) => s + d.receita, 0)
  const totalDespesa = MONTHLY.reduce((s, d) => s + d.despesa, 0)
  const saldo = totalReceita - totalDespesa
  const pendentes = MOVIMENTOS.filter((m) => m.status === 'PENDENTE').length

  const movimentosFiltrados =
    filtro === 'TODOS' ? MOVIMENTOS : MOVIMENTOS.filter((m) => m.tipo === filtro)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Receita YTD" value={fmt(totalReceita)} icon={ArrowUpRight} trend="up" sub="+12% vs ano anterior" />
        <KpiCard title="Despesas YTD" value={fmt(totalDespesa)} icon={ArrowDownRight} trend="down" sub="-3% vs ano anterior" />
        <KpiCard title="Saldo Líquido" value={fmt(saldo)} icon={DollarSign} trend="up" sub="Acumulado no período" />
        <KpiCard title="Pendentes" value={String(pendentes)} icon={Clock} sub={`${pendentes} repasse(s) a confirmar`} />
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Fluxo Financeiro — 2025</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Lançamento
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fill="url(#gReceita)" strokeWidth={2} />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#ef4444" fill="url(#gDespesa)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Movimentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium">Lançamentos Recentes</CardTitle>
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltro(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filtro === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {movimentosFiltrados.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhum lançamento encontrado.
              </p>
            ) : (
              movimentosFiltrados.map((m) => {
                const tipo = TIPO_STYLE[m.tipo] ?? { label: m.tipo, color: 'text-foreground' }
                const isReceita = m.tipo === 'RECEITA'
                const isDespesa = m.tipo === 'DESPESA'
                return (
                  <div key={m.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isReceita ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                        isDespesa ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-amber-100 dark:bg-amber-900/30'
                      }`}>
                        {isReceita ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> :
                         isDespesa ? <ArrowDownRight className="h-4 w-4 text-red-500" /> :
                         <DollarSign className="h-4 w-4 text-amber-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-snug">{m.descricao}</p>
                        <p className="text-xs text-muted-foreground">{tipo.label} · {m.data}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <StatusBadge status={m.status} />
                      <span className={`text-sm font-semibold tabular-nums ${tipo.color}`}>
                        {isDespesa ? '−' : '+'}{fmt(m.valor)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Dados de demonstração — módulo financeiro será integrado à API na Fase 4.
      </p>
    </div>
  )
}
