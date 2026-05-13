'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  useEncerrarLote,
  useLotes,
  useParticipacoesPorLote,
} from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog, DataTable, EmptyState, ViewToggle, type Column } from '@/components/shared'
import { useViewToggle } from '@/hooks/useViewToggle'
import { Button } from '@/components/ui/button'
import type { LoteProducaoResponse, ParticipacaoLoteResponse } from '@/lib/api/producao'
import { CriarLoteDialog } from '../../producao/_components/CriarLoteDialog'
import { RegistrarParticipacaoDialog } from '../../producao/_components/RegistrarParticipacaoDialog'
import { EditarParticipacaoDialog } from './EditarParticipacaoDialog'

const TIPO_LABEL: Record<string, string> = { PRODUCAO: 'Produção', AQUISICAO: 'Aquisição' }

function ParticipacoesList({
  lote,
  associados,
}: {
  lote: LoteProducaoResponse
  associados: { id: string; usuario: { nome: string } }[]
}) {
  const { data: participacoes = [] } = useParticipacoesPorLote(lote.id)
  const [editando, setEditando] = React.useState<ParticipacaoLoteResponse | null>(null)

  const cols: Column<ParticipacaoLoteResponse>[] = [
    {
      key: 'associadoId',
      label: 'Associado',
      render: (r) => associados.find((a) => a.id === r.associadoId)?.usuario.nome ?? r.associadoId,
    },
    {
      key: 'percentual',
      label: 'Percentual (%)',
      render: (r) => (
        <span className="flex items-center gap-1.5">
          {r.percentual.toFixed(2)}%
          {r.percentualManual && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 text-amber-600 border-amber-300">Manual</Badge>
          )}
        </span>
      ),
    },
    {
      key: 'volume',
      label: lote.tipo === 'PRODUCAO' ? 'Volume' : 'Valor Investido',
      render: (r) =>
        lote.tipo === 'PRODUCAO'
          ? (r.volume != null ? `${r.volume} kg` : '—')
          : (r.valorInvestido != null ? `R$ ${r.valorInvestido.toFixed(2)}` : '—'),
    },
    {
      key: 'acoes',
      label: '',
      className: 'w-24 text-right',
      render: (r) =>
        lote.status === 'ABERTO' ? (
          <Button variant="ghost" size="sm" onClick={() => setEditando(r)}>
            Editar
          </Button>
        ) : null,
    },
  ]

  const nomeAssociado = associados.find((a) => a.id === editando?.associadoId)?.usuario.nome ?? ''

  return (
    <>
      {participacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2 px-1">Nenhuma participação registrada.</p>
      ) : (
        <DataTable data={participacoes} columns={cols} rowKey={(r) => r.id} />
      )}
      {editando && (
        <EditarParticipacaoDialog
          loteId={lote.id}
          loteTipo={lote.tipo}
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

function ParticipacoesPanel({
  expandedId,
  loteExpandido,
  associados,
}: {
  expandedId: string | null
  loteExpandido: LoteProducaoResponse | null
  associados: { id: string; usuario: { nome: string } }[]
}) {
  if (!expandedId || !loteExpandido) return null
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Participações — {loteExpandido.periodo} ({TIPO_LABEL[loteExpandido.tipo]})
        </p>
        <TotalParticipacoes loteId={expandedId} />
      </div>
      <ParticipacoesList lote={loteExpandido} associados={associados} />
    </div>
  )
}

function LotesTable({
  lotes,
  associados,
  onNovaParticipacao,
  onEncerrar,
}: {
  lotes: LoteProducaoResponse[]
  associados: { id: string; usuario: { nome: string } }[]
  onNovaParticipacao: (lote: LoteProducaoResponse) => void
  onEncerrar: (lote: LoteProducaoResponse) => void
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const loteExpandido = lotes.find((l) => l.id === expandedId) ?? null

  const cols: Column<LoteProducaoResponse>[] = [
    { key: 'periodo', label: 'Período' },
    { key: 'tipo', label: 'Tipo', render: (r) => TIPO_LABEL[r.tipo] ?? r.tipo },
    {
      key: 'dataInicio',
      label: 'Início',
      render: (r) => format(new Date(r.dataInicio), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'dataFim',
      label: 'Encerramento',
      render: (r) =>
        r.dataFim ? format(new Date(r.dataFim), 'dd/MM/yyyy', { locale: ptBR }) : '—',
    },
    {
      key: 'custoTotal',
      label: 'Custo Total',
      render: (r) => `R$ ${Number(r.custoTotal).toFixed(2)}`,
    },
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
              <Button variant="ghost" size="sm" onClick={() => onNovaParticipacao(r)}>
                + Participação
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onEncerrar(r)}
              >
                Encerrar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        data={lotes}
        columns={cols}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Buscar por período…"
        searchKeys={['periodo']}
      />
      <ParticipacoesPanel
        expandedId={expandedId}
        loteExpandido={loteExpandido}
        associados={associados}
      />
    </div>
  )
}

function LotesGrid({
  lotes,
  associados,
  onNovaParticipacao,
  onEncerrar,
}: {
  lotes: LoteProducaoResponse[]
  associados: { id: string; usuario: { nome: string } }[]
  onNovaParticipacao: (lote: LoteProducaoResponse) => void
  onEncerrar: (lote: LoteProducaoResponse) => void
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const loteExpandido = lotes.find((l) => l.id === expandedId) ?? null

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {lotes.map((l) => (
          <div key={l.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {TIPO_LABEL[l.tipo] ?? l.tipo}
              </span>
              <Badge variant={l.status === 'ABERTO' ? 'default' : 'secondary'} className="text-xs h-5">
                {l.status}
              </Badge>
            </div>

            <p className="text-lg font-bold leading-tight">{l.periodo}</p>

            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
              <span>{format(new Date(l.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
              {l.dataFim && (
                <>
                  <span>→</span>
                  <span>{format(new Date(l.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </>
              )}
            </div>

            <p className="text-sm">
              Custo: <span className="font-semibold">R$ {Number(l.custoTotal).toFixed(2)}</span>
            </p>

            <div className="flex flex-wrap items-center gap-1 border-t pt-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
              >
                {expandedId === l.id ? 'Ocultar' : 'Participações'}
              </Button>
              {l.status === 'ABERTO' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onNovaParticipacao(l)}>
                    + Participação
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onEncerrar(l)}
                  >
                    Encerrar
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ParticipacoesPanel
        expandedId={expandedId}
        loteExpandido={loteExpandido}
        associados={associados}
      />
    </div>
  )
}

export function LotesAdmin() {
  const { data: lotes = [] } = useLotes()
  const { data: associados = [] } = useAssociados()
  const { mutateAsync: encerrar } = useEncerrarLote()

  const [criarOpen, setCriarOpen] = React.useState(false)
  const [encerrarConfirm, setEncerrarConfirm] = React.useState<LoteProducaoResponse | null>(null)
  const [participacaoLote, setParticipacaoLote] = React.useState<LoteProducaoResponse | null>(null)
  const [view, setView] = useViewToggle('lotes')

  const abertos = lotes.filter((l) => l.status === 'ABERTO')
  const encerrados = lotes.filter((l) => l.status !== 'ABERTO')

  async function handleEncerrar() {
    if (!encerrarConfirm) return
    try {
      await encerrar(encerrarConfirm.id)
      toast.success(`Lote "${encerrarConfirm.periodo}" encerrado.`)
    } catch (e) {
      toast.error((e as Error).message ?? 'Erro ao encerrar lote.')
    } finally {
      setEncerrarConfirm(null)
    }
  }

  const LoteList = view === 'grid' ? LotesGrid : LotesTable

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <ViewToggle view={view} onViewChange={setView} />
        <Button onClick={() => setCriarOpen(true)}>+ Novo Lote</Button>
      </div>

      <Tabs defaultValue="abertos">
        <TabsList className="mb-4">
          <TabsTrigger value="abertos">
            Abertos
            {abertos.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{abertos.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="encerrados">
            Encerrados
            {encerrados.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{encerrados.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="abertos">
          {abertos.length === 0 ? (
            <EmptyState
              title="Nenhum lote aberto"
              description="Crie um novo lote para registrar colheitas e participações."
            />
          ) : (
            <LoteList
              lotes={abertos}
              associados={associados}
              onNovaParticipacao={setParticipacaoLote}
              onEncerrar={setEncerrarConfirm}
            />
          )}
        </TabsContent>

        <TabsContent value="encerrados">
          {encerrados.length === 0 ? (
            <EmptyState
              title="Nenhum lote encerrado"
              description="Os lotes encerrados aparecerão aqui."
            />
          ) : (
            <LoteList
              lotes={encerrados}
              associados={associados}
              onNovaParticipacao={setParticipacaoLote}
              onEncerrar={setEncerrarConfirm}
            />
          )}
        </TabsContent>
      </Tabs>

      <CriarLoteDialog open={criarOpen} onOpenChange={setCriarOpen} />

      {participacaoLote && (
        <RegistrarParticipacaoDialog
          loteId={participacaoLote.id}
          loteTipo={participacaoLote.tipo}
          open={true}
          onOpenChange={(o) => { if (!o) setParticipacaoLote(null) }}
        />
      )}

      <ConfirmDialog
        open={encerrarConfirm !== null}
        onOpenChange={(o) => { if (!o) setEncerrarConfirm(null) }}
        title="Encerrar Lote"
        description={`Confirma o encerramento do lote "${encerrarConfirm?.periodo}"? O rateio será congelado.`}
        confirmLabel="Encerrar"
        variant="destructive"
        onConfirm={handleEncerrar}
      />
    </>
  )
}
