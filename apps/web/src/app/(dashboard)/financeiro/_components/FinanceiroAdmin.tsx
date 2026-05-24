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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MensalidadesSection } from './MensalidadesSection'
import { MovimentosSection } from './MovimentosSection'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHLY = [
  { mes: 'Jan', receita: 1200, despesa: 780 },
  { mes: 'Fev', receita: 1850, despesa: 920 },
  { mes: 'Mar', receita: 1400, despesa: 840 },
  { mes: 'Abr', receita: 2100, despesa: 1050 },
  { mes: 'Mai', receita: 1750, despesa: 970 },
  { mes: 'Jun', receita: 2300, despesa: 1100 },
]

function KpiCard({ title, value, icon: Icon, trend, sub }: {
  title: string
  value: string
  icon: React.ElementType
  trend?: 'up' | 'down'
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

function VisaoGeralTab() {
  const totalReceita = MONTHLY.reduce((s, d) => s + d.receita, 0)
  const totalDespesa = MONTHLY.reduce((s, d) => s + d.despesa, 0)
  const saldo = totalReceita - totalDespesa

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Receita YTD" value={fmt(totalReceita)} icon={ArrowUpRight} trend="up" sub="+12% vs ano anterior" />
        <KpiCard title="Despesas YTD" value={fmt(totalDespesa)} icon={ArrowDownRight} trend="down" sub="-3% vs ano anterior" />
        <KpiCard title="Saldo Líquido" value={fmt(saldo)} icon={DollarSign} trend="up" sub="Acumulado no período" />
        <KpiCard title="Inadimplentes" value="—" icon={Clock} sub="Filtrar em Mensalidades" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Fluxo Financeiro — 2025</CardTitle>
            <span className="text-xs text-muted-foreground italic">Dados ilustrativos</span>
          </div>
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fill="url(#gReceita)" strokeWidth={2} />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#ef4444" fill="url(#gDespesa)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
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
