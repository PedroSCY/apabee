'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MONTHLY_DATA, RECEITA_POR_CATEGORIA, REPASSES_PENDENTES } from '../_mock/dashboard.mock'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend?: 'up' | 'down'
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
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const totalReceita = MONTHLY_DATA.reduce((s, d) => s + d.receita, 0)
  const totalDespesa = MONTHLY_DATA.reduce((s, d) => s + d.despesa, 0)
  const liquido = totalReceita - totalDespesa

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Receita YTD"
          value={fmt(totalReceita)}
          subtitle="+12% em relação ao ano anterior"
          icon={DollarSign}
          trend="up"
        />
        <KpiCard
          title="Despesas YTD"
          value={fmt(totalDespesa)}
          subtitle="-3% em relação ao ano anterior"
          icon={TrendingDown}
          trend="down"
        />
        <KpiCard
          title="Líquido YTD"
          value={fmt(liquido)}
          subtitle="Saldo acumulado no período"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Receita vs Despesa — 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4860B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4860B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke="#D4860B"
                fill="url(#colorReceita)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="despesa"
                name="Despesa"
                stroke="#ef4444"
                fill="url(#colorDespesa)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-medium">Repasses Pendentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {REPASSES_PENDENTES.map((r) => (
                <div key={r.nome} className="flex items-center justify-between text-sm">
                  <span>{r.nome}</span>
                  <span className="font-medium text-amber-600">{fmt(r.valor)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={RECEITA_POR_CATEGORIA}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  formatter={(v) => fmt(Number(v))}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                />
                <Bar dataKey="valor" name="Receita" fill="#D4860B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
