'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Play, CheckCheck, X, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/shared'
import {
  useIniciarCampanha, useConcluirCampanha, useCancelarCampanha, useLiquidarCampanha,
} from '@/hooks/useCampanhas'
import type { CampanhaResponse, StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'
import { ContribuicoesTab } from './ContribuicoesTab'
import { CustosTab } from './CustosTab'
import { PedidosTab } from '../[id]/_components/PedidosTab'

const STATUS_CONFIG: Record<StatusCampanha, { label: string; className: string }> = {
  PLANEJADA: { label: 'Planejada', className: 'bg-slate-100 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300' },
  ATIVA: { label: 'Ativa', className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  CONCLUIDA: { label: 'Concluída', className: 'bg-purple-100 text-purple-700 border-transparent dark:bg-purple-950 dark:text-purple-400' },
  LIQUIDADA: { label: 'Liquidada', className: 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 border-transparent dark:bg-gray-900 dark:text-gray-400' },
}

const TIPO_CONFIG: Record<TipoCampanha, { label: string; className: string }> = {
  PRODUCAO: { label: 'Produção', className: 'bg-indigo-100 text-indigo-700 border-transparent dark:bg-indigo-950 dark:text-indigo-400' },
  AQUISICAO: { label: 'Aquisição', className: 'bg-orange-100 text-orange-700 border-transparent dark:bg-orange-950 dark:text-orange-400' },
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function fmtDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

interface Props {
  campanha: CampanhaResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CampanhaDetalheDialog({ campanha, open, onOpenChange }: Props) {
  const [confirmCancelar, setConfirmCancelar] = React.useState(false)
  const [confirmLiquidar, setConfirmLiquidar] = React.useState(false)

  const { mutateAsync: iniciar, isPending: iniciando } = useIniciarCampanha()
  const { mutateAsync: concluir, isPending: concluindo } = useConcluirCampanha()
  const { mutateAsync: cancelar, isPending: cancelando } = useCancelarCampanha()
  const { mutateAsync: liquidar, isPending: liquidando } = useLiquidarCampanha()

  const isPending = iniciando || concluindo || cancelando || liquidando

  async function handleIniciar() {
    try { await iniciar(campanha.id); toast.success('Campanha iniciada.') }
    catch { toast.error('Erro ao iniciar campanha.') }
  }

  async function handleConcluir() {
    try { await concluir(campanha.id); toast.success('Campanha concluída.') }
    catch { toast.error('Erro ao concluir campanha.') }
  }

  async function handleCancelar() {
    try { await cancelar(campanha.id); toast.success('Campanha cancelada.') }
    catch { toast.error('Erro ao cancelar campanha.') }
  }

  async function handleLiquidar() {
    try { await liquidar(campanha.id); toast.success('Campanha liquidada e rateio gerado.') }
    catch { toast.error('Erro ao liquidar campanha.') }
  }

  const statusCfg = STATUS_CONFIG[campanha.status]
  const tipoCfg = TIPO_CONFIG[campanha.tipo]

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
              {campanha.nome}
              <Badge variant="outline" className={tipoCfg.className}>{tipoCfg.label}</Badge>
              <Badge variant="outline" className={statusCfg.className}>{statusCfg.label}</Badge>
            </DialogTitle>
            <p className="font-mono text-xs text-muted-foreground">{campanha.codigo}</p>
          </DialogHeader>

          <div className="rounded-lg border border-border px-3 py-1">
            <InfoRow label="Período" value={`${fmtDate(campanha.dataInicio)} → ${campanha.dataFim ? fmtDate(campanha.dataFim) : '—'}`} />
            <InfoRow label="Receita Total" value={fmt(campanha.receitaTotal)} />
            <InfoRow label="Custo Total" value={fmt(campanha.custoTotal)} />
            <InfoRow label="Resultado" value={fmt(campanha.receitaTotal - campanha.custoTotal)} />
            {campanha.valorMeta && <InfoRow label="Meta" value={fmt(campanha.valorMeta)} />}
          </div>

          <div className="flex flex-wrap gap-2">
            {campanha.status === 'PLANEJADA' && (
              <Button size="sm" onClick={handleIniciar} disabled={isPending}>
                <Play className="h-3.5 w-3.5" /> Iniciar
              </Button>
            )}
            {campanha.status === 'ATIVA' && (
              <Button size="sm" variant="outline" onClick={handleConcluir} disabled={isPending}>
                <CheckCheck className="h-3.5 w-3.5" /> Concluir
              </Button>
            )}
            {campanha.status === 'CONCLUIDA' && (
              <Button size="sm" variant="outline" onClick={() => setConfirmLiquidar(true)} disabled={isPending}>
                <Banknote className="h-3.5 w-3.5" /> Liquidar (irreversível)
              </Button>
            )}
            {(campanha.status === 'PLANEJADA' || campanha.status === 'ATIVA') && (
              <Button
                size="sm" variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmCancelar(true)}
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5" /> Cancelar
              </Button>
            )}
          </div>

          <Tabs defaultValue={campanha.tipo === 'AQUISICAO' && campanha.destinatario === 'INDIVIDUAL' ? 'pedidos' : 'contribuicoes'}>
            <TabsList>
              {campanha.tipo === 'AQUISICAO' && campanha.destinatario === 'INDIVIDUAL' ? (
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              ) : (
                <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
              )}
              <TabsTrigger value="custos">Custos</TabsTrigger>
            </TabsList>
            {campanha.tipo === 'AQUISICAO' && campanha.destinatario === 'INDIVIDUAL' ? (
              <TabsContent value="pedidos" className="mt-4">
                <PedidosTab
                  campanhaId={campanha.id}
                  statusCampanha={campanha.status}
                  isAdmin={true}
                  destinatario={campanha.destinatario}
                />
              </TabsContent>
            ) : (
              <TabsContent value="contribuicoes" className="mt-4">
                <ContribuicoesTab campanhaId={campanha.id} statusCampanha={campanha.status} tipoCampanha={campanha.tipo} />
              </TabsContent>
            )}
            <TabsContent value="custos" className="mt-4">
              <CustosTab campanhaId={campanha.id} statusCampanha={campanha.status} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCancelar}
        onOpenChange={setConfirmCancelar}
        title="Cancelar campanha"
        description={`Deseja cancelar "${campanha.nome}"? Esta ação não pode ser desfeita caso existam contribuições.`}
        confirmLabel="Cancelar Campanha"
        variant="destructive"
        onConfirm={handleCancelar}
        isPending={cancelando}
      />
      <ConfirmDialog
        open={confirmLiquidar}
        onOpenChange={setConfirmLiquidar}
        title="Liquidar campanha"
        description={`Liquidar "${campanha.nome}" calculará o rateio final e gerará movimentos financeiros para todos os participantes. Esta ação é irreversível (RN26).`}
        confirmLabel="Confirmar Liquidação"
        variant="destructive"
        onConfirm={handleLiquidar}
        isPending={liquidando}
      />
    </>
  )
}
