'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, ConfirmDialog } from '@/components/shared'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useCampanhas, useDeletarCampanha } from '@/hooks/useCampanhas'
import type { CampanhaResponse, StatusCampanha, TipoCampanha } from '@/lib/api/campanhas'
import type { ApiError } from '@/lib/api/client'
import { CriarCampanhaDialog } from './CriarCampanhaDialog'

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

function fmtPeriodo(inicio: string, fim?: string) {
  const d1 = format(parseISO(inicio), 'dd/MM/yy', { locale: ptBR })
  return fim ? `${d1} → ${format(parseISO(fim), 'dd/MM/yy', { locale: ptBR })}` : `${d1} →`
}

const STATUS_DELETAVEL: StatusCampanha[] = ['PLANEJADA', 'CANCELADA']

export function AdminCampanhas() {
  const router = useRouter()
  const { data: campanhas = [], isLoading } = useCampanhas()
  const { mutateAsync: deletar, isPending: deletando } = useDeletarCampanha()
  const [criarOpen, setCriarOpen] = React.useState(false)
  const [filtroStatus, setFiltroStatus] = React.useState<StatusCampanha | 'TODAS'>('TODAS')
  const [confirmDeletar, setConfirmDeletar] = React.useState<CampanhaResponse | null>(null)

  const [busca, setBusca] = React.useState('')

  const filtradas = campanhas
    .filter(c => filtroStatus === 'TODAS' || c.status === filtroStatus)
    .filter(c =>
      !busca ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busca.toLowerCase()),
    )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-52">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código…"
                className="pl-8 h-9 text-sm"
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setCriarOpen(true)} className="shrink-0">
              <Plus className="h-4 w-4" /> Nova Campanha
            </Button>
          </div>

          <Tabs
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as StatusCampanha | 'TODAS')}
          >
            <TabsList>
              <TabsTrigger value="TODAS">Todas</TabsTrigger>
              <TabsTrigger value="ATIVA">Ativas</TabsTrigger>
              <TabsTrigger value="PLANEJADA">Planejadas</TabsTrigger>
              <TabsTrigger value="CONCLUIDA">Concluídas</TabsTrigger>
              <TabsTrigger value="LIQUIDADA">Liquidadas</TabsTrigger>
              <TabsTrigger value="CANCELADA">Canceladas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filtradas.length === 0 ? (
          <EmptyState
            title={campanhas.length === 0 ? 'Nenhuma campanha criada' : 'Nenhuma campanha encontrada'}
            description={
              campanhas.length === 0
                ? 'Crie a primeira campanha para começar.'
                : 'Tente ajustar os filtros de busca.'
            }
          />
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right w-36">Receita / Meta</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map(c => {
                  const sCfg = STATUS_CONFIG[c.status]
                  const tCfg = TIPO_CONFIG[c.tipo]
                  return (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/campanhas/${c.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.codigo}</TableCell>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tCfg.className}>{tCfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={sCfg.className}>{sCfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {fmtPeriodo(c.dataInicio, c.dataFim)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-sm">
                        {c.tipo === 'AQUISICAO' && c.valorMeta ? fmt(c.valorMeta) : fmt(c.receitaTotal)}
                      </TableCell>
                      <TableCell>
                        {STATUS_DELETAVEL.includes(c.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            disabled={deletando}
                            onClick={(e) => { e.stopPropagation(); setConfirmDeletar(c) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CriarCampanhaDialog open={criarOpen} onOpenChange={setCriarOpen} />

      <ConfirmDialog
        open={Boolean(confirmDeletar)}
        onOpenChange={(v) => { if (!v) setConfirmDeletar(null) }}
        title="Excluir campanha"
        description={`Deseja excluir permanentemente "${confirmDeletar?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        isPending={deletando}
        onConfirm={async () => {
          if (!confirmDeletar) return
          try {
            await deletar(confirmDeletar.id)
            toast.success('Campanha excluída.')
            setConfirmDeletar(null)
          } catch (e) {
            toast.error((e as ApiError).message ?? 'Erro ao excluir campanha.')
          }
        }}
      />
    </>
  )
}
