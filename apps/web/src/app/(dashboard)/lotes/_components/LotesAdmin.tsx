'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  useEncerrarLote,
  useLotes,
  useParticipacoesPorLote,
  useRegistrarParticipacao,
} from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import { ConfirmDialog, DataTable, EmptyState, StatusBadge, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { LoteProducaoResponse, ParticipacaoLoteResponse } from '@/lib/api/producao'
import { CriarLoteDialog } from '../../producao/_components/CriarLoteDialog'
import { RegistrarParticipacaoDialog } from '../../producao/_components/RegistrarParticipacaoDialog'
import { EditarParticipacaoDialog } from './EditarParticipacaoDialog'

const TIPO_LABEL: Record<string, string> = { PRODUCAO: 'Produção', AQUISICAO: 'Aquisição' }

function ParticipacoesList({
  loteId,
  associados,
}: {
  loteId: string
  associados: { id: string; usuario: { nome: string } }[]
}) {
  const { data: participacoes = [] } = useParticipacoesPorLote(loteId)
  const [editando, setEditando] = React.useState<ParticipacaoLoteResponse | null>(null)

  const cols: Column<ParticipacaoLoteResponse>[] = [
    {
      key: 'associadoId',
      label: 'Associado',
      render: (r) => associados.find((a) => a.id === r.associadoId)?.usuario.nome ?? r.associadoId,
    },
    { key: 'percentual', label: 'Percentual (%)', render: (r) => `${r.percentual}%` },
    { key: 'volume', label: 'Volume', render: (r) => (r.volume != null ? `${r.volume}` : '—') },
    {
      key: 'valorInvestido',
      label: 'Valor Investido',
      render: (r) => (r.valorInvestido != null ? `R$ ${r.valorInvestido.toFixed(2)}` : '—'),
    },
    {
      key: 'acoes',
      label: '',
      className: 'w-24 text-right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setEditando(r)}>
          Editar
        </Button>
      ),
    },
  ]

  const nomeAssociado =
    associados.find((a) => a.id === editando?.associadoId)?.usuario.nome ?? ''

  return (
    <>
      {participacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2 px-1">Nenhuma participação registrada.</p>
      ) : (
        <DataTable data={participacoes} columns={cols} rowKey={(r) => r.id} />
      )}

      {editando && (
        <EditarParticipacaoDialog
          loteId={loteId}
          participacao={editando}
          nomAssociado={nomeAssociado}
          open={true}
          onOpenChange={(o) => { if (!o) setEditando(null) }}
        />
      )}
    </>
  )
}

function TotalParticipacoes({ loteId }: { loteId: string }) {
  const { data: participacoes = [] } = useParticipacoesPorLote(loteId)
  const total = participacoes.reduce((sum, p) => sum + p.percentual, 0)
  if (participacoes.length === 0) return null
  return (
    <span className={`text-xs font-medium ${total > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
      {total.toFixed(1)}% alocado
    </span>
  )
}

export function LotesAdmin() {
  const { data: lotes = [] } = useLotes()
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: encerrar } = useEncerrarLote()

  const [criarOpen, setCriarOpen] = React.useState(false)
  const [encerrarConfirm, setEncerrarConfirm] = React.useState<{ id: string; periodo: string } | null>(null)
  const [participacaoLoteId, setParticipacaoLoteId] = React.useState<string | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const loteCols: Column<LoteProducaoResponse>[] = [
    { key: 'periodo', label: 'Período' },
    { key: 'tipo', label: 'Tipo', render: (r) => TIPO_LABEL[r.tipo] ?? r.tipo },
    {
      key: 'dataInicio',
      label: 'Início',
      render: (r) => format(new Date(r.dataInicio), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'dataFim',
      label: 'Encerrado em',
      render: (r) =>
        r.dataFim ? format(new Date(r.dataFim), 'dd/MM/yyyy', { locale: ptBR }) : '—',
    },
    {
      key: 'custoTotal',
      label: 'Custo Total',
      render: (r) => `R$ ${Number(r.custoTotal).toFixed(2)}`,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'acoes',
      label: '',
      className: 'w-72 text-right',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
          >
            {expandedId === r.id ? 'Ocultar' : 'Participações'}
          </Button>
          {r.status === 'ABERTO' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setParticipacaoLoteId(r.id)}>
                + Participação
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setEncerrarConfirm({ id: r.id, periodo: r.periodo })}
              >
                Encerrar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  async function handleEncerrar() {
    if (!encerrarConfirm) return
    try {
      await encerrar(encerrarConfirm.id)
      toast.success(`Lote "${encerrarConfirm.periodo}" encerrado. Rateio congelado.`)
      setExpandedId(null)
    } catch (e) {
      toast.error((e as Error).message ?? 'Erro ao encerrar lote.')
    } finally {
      setEncerrarConfirm(null)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setCriarOpen(true)}>+ Novo Lote</Button>
      </div>

      {lotes.length === 0 ? (
        <EmptyState
          title="Nenhum lote criado"
          description="Crie o primeiro lote para registrar colheitas e participações."
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            data={lotes}
            columns={loteCols}
            rowKey={(r) => r.id}
            searchable
            searchPlaceholder="Buscar por período…"
            searchKeys={['periodo']}
          />

          {expandedId && (
            <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Participações — {lotes.find((l) => l.id === expandedId)?.periodo}
                </p>
                <TotalParticipacoes loteId={expandedId} />
              </div>
              <ParticipacoesList loteId={expandedId} associados={associados} />
            </div>
          )}
        </div>
      )}

      <CriarLoteDialog open={criarOpen} onOpenChange={setCriarOpen} />

      {participacaoLoteId && (
        <RegistrarParticipacaoDialog
          loteId={participacaoLoteId}
          open={true}
          onOpenChange={(o) => { if (!o) setParticipacaoLoteId(null) }}
        />
      )}

      <ConfirmDialog
        open={encerrarConfirm !== null}
        onOpenChange={(o) => { if (!o) setEncerrarConfirm(null) }}
        title="Encerrar Lote"
        description={`Confirma o encerramento do lote "${encerrarConfirm?.periodo}"? O rateio será congelado e não poderá ser reaberto.`}
        confirmLabel="Encerrar"
        variant="destructive"
        onConfirm={handleEncerrar}
      />
    </>
  )
}
