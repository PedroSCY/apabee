'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, DollarSign, PowerOff, Leaf } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState, ConfirmDialog } from '@/components/shared'
import { useSafras, useEncerrarSafra } from '@/hooks/useSafras'
import { useFloradas } from '@/hooks/useFloradas'
import type { SafraResponse, StatusSafra } from '@/lib/api/safras'
import type { FloradaResponse } from '@/lib/api/floradas'
import { CriarSafraDialog } from './CriarSafraDialog'
import { CriarFloradaDialog } from './CriarFloradaDialog'
import { PrecosSafraDialog } from './PrecosSafraDialog'

const STATUS_CONFIG: Record<StatusSafra, { label: string; className: string }> = {
  PLANEJADA: { label: 'Planejada', className: 'bg-slate-100 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300' },
  EM_ANDAMENTO: { label: 'Em Andamento', className: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-400' },
  ENCERRADA: { label: 'Encerrada', className: 'bg-gray-100 text-gray-500 border-transparent dark:bg-gray-900 dark:text-gray-400' },
}

type FiltroStatus = 'EM_ANDAMENTO' | 'PLANEJADA' | 'ENCERRADA'

function fmtDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

function SafraCard({ safra }: { safra: SafraResponse }) {
  const { mutateAsync: encerrar, isPending } = useEncerrarSafra()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [precosOpen, setPrecosOpen] = React.useState(false)

  const sCfg = STATUS_CONFIG[safra.status]
  const podeEncerrar = safra.status === 'EM_ANDAMENTO' || safra.status === 'PLANEJADA'

  async function handleEncerrar() {
    try {
      await encerrar(safra.id)
      toast.success('Safra encerrada.')
    } catch {
      toast.error('Erro ao encerrar safra.')
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight">{safra.nome}</CardTitle>
            <Badge variant="outline" className={sCfg.className}>{sCfg.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">🌿 {safra.floradaNome ?? safra.floradaId}</p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-muted-foreground">
            {fmtDate(safra.dataInicio)}
            {safra.dataFim ? ` → ${fmtDate(safra.dataFim)}` : ' → em aberto'}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setPrecosOpen(true)}
            >
              <DollarSign className="size-3" /> Preços
            </Button>
            {podeEncerrar && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
                disabled={isPending}
              >
                <PowerOff className="size-3" /> Encerrar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Encerrar safra?"
        description={`A safra "${safra.nome}" será marcada como encerrada. Esta ação não pode ser desfeita.`}
        confirmLabel="Encerrar"
        variant="destructive"
        onConfirm={handleEncerrar}
        isPending={isPending}
      />

      <PrecosSafraDialog safra={safra} open={precosOpen} onOpenChange={setPrecosOpen} />
    </>
  )
}

function FloradaCard({ florada }: { florada: FloradaResponse }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Leaf className="size-4 text-emerald-600" />
          <CardTitle className="text-sm font-semibold">{florada.nome}</CardTitle>
          {!florada.ativa && (
            <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">Inativa</Badge>
          )}
        </div>
        {florada.descricao && (
          <p className="text-xs text-muted-foreground">{florada.descricao}</p>
        )}
      </CardHeader>
    </Card>
  )
}

function SafrasTab() {
  const { data: safras = [], isLoading } = useSafras()
  const [criarOpen, setCriarOpen] = React.useState(false)
  const [filtro, setFiltro] = React.useState<FiltroStatus>('EM_ANDAMENTO')

  const filtradas = safras.filter(s => s.status === filtro)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as FiltroStatus)}>
          <TabsList>
            <TabsTrigger value="EM_ANDAMENTO">Em Andamento</TabsTrigger>
            <TabsTrigger value="PLANEJADA">Planejadas</TabsTrigger>
            <TabsTrigger value="ENCERRADA">Encerradas</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button size="sm" onClick={() => setCriarOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Nova Safra
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : filtradas.length === 0 ? (
        <EmptyState
          title={`Nenhuma safra ${filtro === 'EM_ANDAMENTO' ? 'em andamento' : filtro === 'PLANEJADA' ? 'planejada' : 'encerrada'}`}
          description={filtro !== 'ENCERRADA' ? 'Crie uma nova safra para começar.' : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtradas.map(s => <SafraCard key={s.id} safra={s} />)}
        </div>
      )}

      <CriarSafraDialog open={criarOpen} onOpenChange={setCriarOpen} />
    </>
  )
}

function FlораdasTab() {
  const { data: floradas = [], isLoading } = useFloradas()
  const [criarOpen, setCriarOpen] = React.useState(false)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Tipos de florada disponíveis para as safras.
        </p>
        <Button size="sm" onClick={() => setCriarOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Nova Florada
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : floradas.length === 0 ? (
        <EmptyState title="Nenhuma florada cadastrada" description="Crie a primeira florada para usar nas safras." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {floradas.map(f => <FloradaCard key={f.id} florada={f} />)}
        </div>
      )}

      <CriarFloradaDialog open={criarOpen} onOpenChange={setCriarOpen} />
    </>
  )
}

export function AdminSafras() {
  return (
    <Tabs defaultValue="safras" className="space-y-4">
      <TabsList>
        <TabsTrigger value="safras">Safras</TabsTrigger>
        <TabsTrigger value="floradas">Floradas</TabsTrigger>
      </TabsList>

      <TabsContent value="safras" className="space-y-4">
        <SafrasTab />
      </TabsContent>

      <TabsContent value="floradas" className="space-y-4">
        <FlораdasTab />
      </TabsContent>
    </Tabs>
  )
}
