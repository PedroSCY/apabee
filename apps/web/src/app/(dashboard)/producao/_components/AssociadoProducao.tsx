'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useColheitasPorAssociado, useTiposMateriaPrima } from '@/hooks/useProducao'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { useCampanhas, useContribuicoes } from '@/hooks/useCampanhas'
import { DataTable, EmptyState, type Column } from '@/components/shared'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ColheitaResponse } from '@/lib/api/producao'
import type { CampanhaResponse, StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'

const STATUS_CONFIG: Record<StatusCampanha, { label: string; className: string }> = {
  PLANEJADA: { label: 'Planejada', className: 'bg-slate-100 text-slate-700 border-transparent' },
  ATIVA: { label: 'Ativa', className: 'bg-emerald-100 text-emerald-700 border-transparent' },
  CONCLUIDA: { label: 'Concluída', className: 'bg-purple-100 text-purple-700 border-transparent' },
  LIQUIDADA: { label: 'Liquidada', className: 'bg-amber-100 text-amber-700 border-transparent' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 border-transparent' },
}

const TIPO_CONFIG: Record<TipoCampanha, { label: string; className: string }> = {
  PRODUCAO: { label: 'Produção', className: 'bg-indigo-100 text-indigo-700 border-transparent' },
  AQUISICAO: { label: 'Aquisição', className: 'bg-orange-100 text-orange-700 border-transparent' },
}

const TIPO_CONTRIBUICAO_LABELS: Record<string, string> = {
  COLHEITA: 'Colheita',
  DINHEIRO: 'Dinheiro',
  MAO_DE_OBRA: 'Mão de obra',
  CONSUMIVEL: 'Consumível',
  EQUIPAMENTO: 'Equipamento',
  ACORDO: 'Acordo',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function contribuicaoDetalhe(tipo: string, volume?: number, horas?: number, descricao?: string): string {
  if (tipo === 'COLHEITA' && volume) return `${TIPO_CONTRIBUICAO_LABELS[tipo]}: ${volume}`
  if (tipo === 'MAO_DE_OBRA' && horas) return `${TIPO_CONTRIBUICAO_LABELS[tipo]}: ${horas}h`
  if (descricao) return `${TIPO_CONTRIBUICAO_LABELS[tipo] ?? tipo}: ${descricao}`
  return TIPO_CONTRIBUICAO_LABELS[tipo] ?? tipo
}

// Sub-componente por campanha — cada um chama seu próprio hook (evita chamada condicional)
function CampanhaContribuicaoCard({ campanha, associadoId }: {
  campanha: CampanhaResponse
  associadoId: string
}) {
  const { data: contribuicoes = [], isLoading } = useContribuicoes(campanha.id)
  const minhas = contribuicoes.filter(c => c.associadoId === associadoId)

  if (isLoading) return <Skeleton className="h-24 w-full rounded-xl" />
  if (minhas.length === 0) return null

  const total = minhas.reduce((s, c) => s + c.valorMonetario, 0)
  const statusCfg = STATUS_CONFIG[campanha.status]
  const tipoCfg = TIPO_CONFIG[campanha.tipo]

  return (
    <Link href={`/campanhas/${campanha.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight">{campanha.nome}</CardTitle>
            <Badge variant="outline" className={statusCfg.className}>{statusCfg.label}</Badge>
          </div>
          <Badge variant="outline" className={tipoCfg.className}>{tipoCfg.label}</Badge>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {minhas.map(c => (
            <p key={c.id} className="text-xs text-muted-foreground">
              {contribuicaoDetalhe(c.tipo, c.volume, c.horas, c.descricao)}
              {' → '}
              <span className="text-foreground font-medium">{fmt(c.valorMonetario)}</span>
            </p>
          ))}
          {minhas.length > 1 && (
            <p className="text-xs font-semibold text-foreground mt-1">Total: {fmt(total)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function MinhasContribuicoes({ associadoId }: { associadoId: string }) {
  const { data: campanhas = [], isLoading } = useCampanhas()

  const visiveis = campanhas.filter(c => c.status !== 'CANCELADA')
  const emAndamento = visiveis.filter(c => c.status === 'PLANEJADA' || c.status === 'ATIVA')
  const encerradas = visiveis.filter(c => c.status === 'CONCLUIDA' || c.status === 'LIQUIDADA')

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    )
  }

  if (visiveis.length === 0) {
    return (
      <EmptyState
        title="Nenhuma campanha disponível"
        description="Suas contribuições em campanhas aparecerão aqui quando houver campanhas ativas."
      />
    )
  }

  return (
    <div className="space-y-6">
      {emAndamento.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Em Andamento</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {emAndamento.map(c => (
              <CampanhaContribuicaoCard key={c.id} campanha={c} associadoId={associadoId} />
            ))}
          </div>
        </div>
      )}
      {encerradas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Encerradas</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {encerradas.map(c => (
              <CampanhaContribuicaoCard key={c.id} campanha={c} associadoId={associadoId} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AssociadoProducao() {
  const { data: meuPerfil } = useMeuPerfil()
  const meuAssociadoId = meuPerfil?.id ?? ''
  const { data: colheitas = [] } = useColheitasPorAssociado(meuAssociadoId)
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { data: campanhas = [] } = useCampanhas()

  const tipoNome = (id: string) => tipos.find(t => t.id === id)?.nome ?? '—'
  const campanhaNome = (id?: string) =>
    id ? campanhas.find(c => c.id === id)?.nome ?? id.slice(0, 8) : null

  const colheitaCols: Column<ColheitaResponse>[] = [
    {
      key: 'dataColheita',
      label: 'Data',
      render: (r) => format(new Date(r.dataColheita), 'dd/MM/yyyy', { locale: ptBR }),
    },
    { key: 'tipoMateriaPrimaId', label: 'Tipo', render: (r) => tipoNome(r.tipoMateriaPrimaId) },
    { key: 'volume', label: 'Volume', render: (r) => `${r.volume} ${r.unidade}` },
    {
      key: 'campanhaId',
      label: 'Campanha',
      render: (r) => {
        const nome = campanhaNome(r.campanhaId)
        return nome
          ? <span className="font-medium">{nome}</span>
          : <span className="text-muted-foreground text-xs">Pool geral</span>
      },
    },
    { key: 'observacao', label: 'Obs', render: (r) => r.observacao ?? '—' },
  ]

  return (
    <Tabs defaultValue="colheitas">
      <TabsList className="mb-6">
        <TabsTrigger value="colheitas">Minhas Colheitas</TabsTrigger>
        <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
      </TabsList>

      <TabsContent value="colheitas">
        {!meuAssociadoId ? (
          <EmptyState title="Perfil não encontrado" description="Entre em contato com o administrador." />
        ) : (
          <DataTable
            data={colheitas}
            columns={colheitaCols}
            rowKey={(r) => r.id}
            emptyTitle="Nenhuma colheita registrada"
            emptyDescription="Suas colheitas aparecerão aqui após serem lançadas pelo administrador."
          />
        )}
      </TabsContent>

      <TabsContent value="contribuicoes">
        {!meuAssociadoId ? (
          <EmptyState title="Perfil não encontrado" description="Entre em contato com o administrador." />
        ) : (
          <MinhasContribuicoes associadoId={meuAssociadoId} />
        )}
      </TabsContent>
    </Tabs>
  )
}
