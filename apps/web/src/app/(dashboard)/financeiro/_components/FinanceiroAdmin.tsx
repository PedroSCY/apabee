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
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { MensalidadesSection } from './MensalidadesSection'
import { MovimentosSection } from './MovimentosSection'
import { useDashboardFinanceiro } from '@/hooks/useFinanceiro'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function KpiCard({ title, value, icon: Icon, sub, loading }: {
  title: string
  value: string
  icon: React.ElementType
  sub?: string
  loading?: boolean
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
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        {sub && !loading && (
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}

function VisaoGeralTab() {
  const ano = new Date().getFullYear()
  const { data: dashboard, isLoading } = useDashboardFinanceiro(ano)

  const grafico = (dashboard?.graficoMensal ?? []).map((d) => ({
    mes: MESES[d.mes - 1] ?? String(d.mes),
    receita: d.receita,
    despesa: d.despesa,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Receita no ano"
          value={fmt(dashboard?.receitaYTD ?? 0)}
          icon={ArrowUpRight}
          loading={isLoading}
        />
        <KpiCard
          title="Despesas no ano"
          value={fmt(dashboard?.despesasYTD ?? 0)}
          icon={ArrowDownRight}
          loading={isLoading}
        />
        <KpiCard
          title="Saldo Líquido"
          value={fmt(dashboard?.saldoLiquido ?? 0)}
          icon={DollarSign}
          loading={isLoading}
        />
        <KpiCard
          title="Inadimplentes"
          value={isLoading ? '…' : String(dashboard?.inadimplentes ?? 0)}
          icon={Clock}
          sub="associados com mensalidade pendente"
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Fluxo Financeiro — {ano}
            </CardTitle>
            {isLoading && <TrendingUp className="h-4 w-4 animate-pulse text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-55 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={grafico} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fill="url(#gReceita)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#ef4444" fill="url(#gDespesa)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function FinanceiroAdmin() {
  return (
    <Tabs defaultValue="mensalidades">
      <TabsList className="mb-6">
        <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
        <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
      </TabsList>

      <TabsContent value="visao-geral">
        <VisaoGeralTab />
      </TabsContent>

      <TabsContent value="mensalidades">
        <MensalidadesSection />
      </TabsContent>

      <TabsContent value="movimentos">
        <MovimentosSection />
      </TabsContent>
    </Tabs>
  )
}
