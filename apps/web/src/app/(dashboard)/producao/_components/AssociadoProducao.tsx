'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useColheitasPorAssociado, useLotes, useParticipacoesPorLote } from '@/hooks/useProducao'
import { useMeuPerfil } from '@/hooks/useAssociados'
import { DataTable, EmptyState, StatusBadge, type Column } from '@/components/shared'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { ColheitaResponse, LoteProducaoResponse, ParticipacaoLoteResponse } from '@/lib/api/producao'

const TIPO_LABEL: Record<string, string> = { PRODUCAO: 'Produção', AQUISICAO: 'Aquisição' }

const loteCols: Column<LoteProducaoResponse>[] = [
  { key: 'periodo', label: 'Período' },
  { key: 'tipo', label: 'Tipo', render: (r) => TIPO_LABEL[r.tipo] ?? r.tipo },
  { key: 'dataInicio', label: 'Início', render: (r) => format(new Date(r.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) },
  { key: 'dataFim', label: 'Fim', render: (r) => r.dataFim ? format(new Date(r.dataFim), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

const colheitaCols: Column<ColheitaResponse>[] = [
  { key: 'dataColheita', label: 'Data', render: (r) => format(new Date(r.dataColheita), 'dd/MM/yyyy', { locale: ptBR }) },
  { key: 'volume', label: 'Volume', render: (r) => `${r.volume} ${r.unidade}` },
  { key: 'observacao', label: 'Obs', render: (r) => r.observacao ?? '—' },
]

function MinhasParticipacoes({ associadoId, lotes }: { associadoId: string; lotes: LoteProducaoResponse[] }) {
  if (!lotes.length) return <EmptyState title="Nenhum lote disponível" description="Aguarde o administrador criar um lote." />

  return (
    <div className="space-y-6">
      {lotes.map((lote) => (
        <ParticipacaoDoLote key={lote.id} lote={lote} associadoId={associadoId} />
      ))}
    </div>
  )
}

function ParticipacaoDoLote({ lote, associadoId }: { lote: LoteProducaoResponse; associadoId: string }) {
  const { data: participacoes = [] } = useParticipacoesPorLote(lote.id)
  const minha = participacoes.find((p) => p.associadoId === associadoId)

  if (!minha) return null

  const partCols: Column<ParticipacaoLoteResponse>[] = [
    { key: 'percentual', label: 'Percentual', render: (r) => `${r.percentual}%` },
    { key: 'volume', label: 'Volume', render: (r) => r.volume != null ? `${r.volume}` : '—' },
    { key: 'valorInvestido', label: 'Valor Investido', render: (r) => r.valorInvestido != null ? `R$ ${r.valorInvestido.toFixed(2)}` : '—' },
  ]

  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">{lote.periodo}</span>
        <StatusBadge status={lote.status} />
      </div>
      <DataTable data={[minha]} columns={partCols} rowKey={(r) => r.id} />
    </div>
  )
}

const TABS = [
  { value: 'lotes', label: 'Lotes' },
  { value: 'contribuicoes', label: 'Minhas Contribuições' },
  { value: 'colheitas', label: 'Minhas Colheitas' },
]

export function AssociadoProducao() {
  const { data: lotes = [] } = useLotes()
  const { data: meuPerfil } = useMeuPerfil()

  const meuAssociadoId = meuPerfil?.id ?? ''

  const { data: colheitas = [] } = useColheitasPorAssociado(meuAssociadoId)

  return (
    <Tabs defaultValue="lotes">
      <TabsList className="mb-6">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="lotes">
        <DataTable data={lotes} columns={loteCols} rowKey={(r) => r.id}
          searchable searchPlaceholder="Buscar período…" searchKeys={['periodo']}
          emptyTitle="Nenhum lote disponível" />
      </TabsContent>

      <TabsContent value="contribuicoes">
        {!meuAssociadoId ? (
          <EmptyState title="Perfil não encontrado" description="Entre em contato com o administrador." />
        ) : (
          <MinhasParticipacoes associadoId={meuAssociadoId} lotes={lotes} />
        )}
      </TabsContent>

      <TabsContent value="colheitas">
        {!meuAssociadoId ? (
          <EmptyState title="Perfil não encontrado" description="Entre em contato com o administrador." />
        ) : (
          <DataTable data={colheitas} columns={colheitaCols} rowKey={(r) => r.id}
            emptyTitle="Nenhuma colheita registrada" />
        )}
      </TabsContent>
    </Tabs>
  )
}
