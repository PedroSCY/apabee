'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useColheitasPorLote, useEncerrarLote, useLotes } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import {
  ConfirmDialog,
  DataTable,
  EmptyState,
  StatusBadge,
  type Column,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { ColheitaResponse, LoteProducaoResponse } from '@/lib/api/producao'
import { CriarLoteDialog } from './CriarLoteDialog'
import { RegistrarColheitaDialog } from './RegistrarColheitaDialog'
import { RegistrarParticipacaoDialog } from './RegistrarParticipacaoDialog'

const TIPO_LABEL: Record<string, string> = { PRODUCAO: 'Produção', AQUISICAO: 'Aquisição' }

function ColheitasDoLote({ loteId, associados }: { loteId: string; associados: { id: string; usuario: { nome: string } }[] }) {
  const { data: colheitas = [] } = useColheitasPorLote(loteId)

  const cols: Column<ColheitaResponse>[] = [
    { key: 'associadoId', label: 'Associado', render: (r) => associados.find((a) => a.id === r.associadoId)?.usuario.nome ?? r.associadoId },
    { key: 'volume', label: 'Volume', render: (r) => `${r.volume} ${r.unidade}` },
    { key: 'dataColheita', label: 'Data', render: (r) => format(new Date(r.dataColheita), 'dd/MM/yyyy', { locale: ptBR }) },
    { key: 'observacao', label: 'Obs', render: (r) => r.observacao ?? '—' },
  ]

  if (!colheitas.length) return <p className="text-sm text-muted-foreground py-2">Sem colheitas registradas.</p>
  return <DataTable data={colheitas} columns={cols} rowKey={(r) => r.id} />
}

export function AdminProducao() {
  const { data: lotes = [] } = useLotes()
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: encerrar } = useEncerrarLote()

  const [criarLoteOpen, setCriarLoteOpen] = React.useState(false)
  const [colheitaOpen, setColheitaOpen] = React.useState(false)
  const [encerrarConfirm, setEncerrarConfirm] = React.useState<{ id: string; periodo: string } | null>(null)
  const [participacaoLoteId, setParticipacaoLoteId] = React.useState<string | null>(null)
  const [expandedLoteId, setExpandedLoteId] = React.useState<string | null>(null)

  const loteCols: Column<LoteProducaoResponse>[] = [
    { key: 'periodo', label: 'Período' },
    { key: 'tipo', label: 'Tipo', render: (r) => TIPO_LABEL[r.tipo] ?? r.tipo },
    { key: 'dataInicio', label: 'Início', render: (r) => format(new Date(r.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'acoes', label: '', className: 'w-64 text-right',
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setExpandedLoteId(expandedLoteId === r.id ? null : r.id)}>
            {expandedLoteId === r.id ? 'Ocultar' : 'Colheitas'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setParticipacaoLoteId(r.id)}>+ Participação</Button>
          {r.status === 'ABERTO' && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
              onClick={() => setEncerrarConfirm({ id: r.id, periodo: r.periodo })}>
              Encerrar
            </Button>
          )}
        </div>
      ),
    },
  ]

  async function handleEncerrar() {
    if (!encerrarConfirm) return
    try {
      await encerrar(encerrarConfirm.id)
      toast.success(`Lote ${encerrarConfirm.periodo} encerrado.`)
    } catch { toast.error('Erro ao encerrar lote.') }
    finally { setEncerrarConfirm(null) }
  }

  return (
    <>
      <Tabs defaultValue="lotes">
        <TabsList className="mb-6">
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
          <TabsTrigger value="colheitas">Registrar Colheita</TabsTrigger>
        </TabsList>

        <TabsContent value="lotes">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setCriarLoteOpen(true)}>+ Novo Lote</Button>
          </div>
          {lotes.length === 0 ? (
            <EmptyState title="Nenhum lote criado" description="Crie o primeiro lote de produção." />
          ) : (
            <div className="space-y-4">
              <DataTable data={lotes} columns={loteCols} rowKey={(r) => r.id}
                searchable searchPlaceholder="Buscar período…" searchKeys={['periodo']} />
              {expandedLoteId && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-3">Colheitas do lote</p>
                  <ColheitasDoLote loteId={expandedLoteId} associados={associados} />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="colheitas">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setColheitaOpen(true)}>+ Registrar Colheita</Button>
          </div>
          <EmptyState
            title="Selecione um lote para ver colheitas"
            description="Use a aba Lotes → Colheitas para visualizar registros por lote." />
        </TabsContent>
      </Tabs>

      <CriarLoteDialog open={criarLoteOpen} onOpenChange={setCriarLoteOpen} />
      <RegistrarColheitaDialog open={colheitaOpen} onOpenChange={setColheitaOpen} />

      {participacaoLoteId && (
        <RegistrarParticipacaoDialog
          loteId={participacaoLoteId}
          open={true}
          onOpenChange={(o) => { if (!o) setParticipacaoLoteId(null) }} />
      )}

      <ConfirmDialog
        open={encerrarConfirm !== null}
        onOpenChange={(o) => { if (!o) setEncerrarConfirm(null) }}
        title="Encerrar Lote"
        description={`Confirma o encerramento do lote "${encerrarConfirm?.periodo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Encerrar" variant="destructive"
        onConfirm={handleEncerrar} />
    </>
  )
}
