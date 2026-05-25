'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Plus, Trash2, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useColheitas, useTiposMateriaPrima, useDeletarColheita } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import { useCampanhas } from '@/hooks/useCampanhas'
import { DataTable, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ColheitaResponse } from '@/lib/api/producao'
import { RegistrarColheitaDialog } from './RegistrarColheitaDialog'

const TODOS = '__todos__'

export function ColheitasTab() {
  const { data: colheitas = [], isLoading } = useColheitas()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { data: associados = [] } = useAssociados()
  const { data: campanhas = [] } = useCampanhas()
  const { mutate: deletar, isPending: deletando } = useDeletarColheita()

  const [filtroAssociado, setFiltroAssociado] = React.useState(TODOS)
  const [filtroTipo, setFiltroTipo] = React.useState(TODOS)
  const [colheitaOpen, setColheitaOpen] = React.useState(false)

  const temFiltro = filtroAssociado !== TODOS || filtroTipo !== TODOS

  const tipoNome = (id: string) => tipos.find((t) => t.id === id)?.nome ?? '—'
  const associadoNome = (id: string) => associados.find((a) => a.id === id)?.usuario.nome ?? id.slice(0, 8)
  const campanhaNome = (id?: string) => id ? campanhas.find((c) => c.id === id)?.nome ?? id.slice(0, 8) : null

  const filtradas = React.useMemo(() => colheitas.filter((c) => {
    if (filtroAssociado !== TODOS && c.associadoId !== filtroAssociado) return false
    if (filtroTipo !== TODOS && c.tipoMateriaPrimaId !== filtroTipo) return false
    return true
  }), [colheitas, filtroAssociado, filtroTipo])

  const cols: Column<ColheitaResponse>[] = [
    { key: 'associadoId', label: 'Associado', render: (r) => associadoNome(r.associadoId) },
    { key: 'tipoMateriaPrimaId', label: 'Tipo', render: (r) => tipoNome(r.tipoMateriaPrimaId) },
    { key: 'volume', label: 'Volume', render: (r) => `${r.volume} ${r.unidade}` },
    { key: 'dataColheita', label: 'Data', render: (r) => format(new Date(r.dataColheita), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      key: 'campanhaId', label: 'Destino',
      render: (r) => {
        const nome = campanhaNome(r.campanhaId)
        return nome
          ? <span className="font-medium">{nome}</span>
          : <span className="text-muted-foreground text-xs">Pool geral</span>
      },
    },
    { key: 'observacao', label: 'Obs', render: (r) => r.observacao ?? '—' },
    {
      key: 'id', label: '',
      render: (r) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deletando}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir colheita?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta colheita de <strong>{r.volume} {r.unidade}</strong> de <strong>{tipoNome(r.tipoMateriaPrimaId)}</strong> será removida permanentemente junto com seu movimento de estoque.
                <br /><br />
                A exclusão só é permitida se a matéria-prima ainda não foi consumida em nenhuma ordem de produção.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deletar(r.id, {
                  onSuccess: () => toast.success('Colheita removida.'),
                  onError: (e) => toast.error((e as { message?: string }).message ?? 'Erro ao remover colheita.'),
                })}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex flex-wrap gap-3 flex-1 items-end">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Associado</p>
            <Select value={filtroAssociado} onValueChange={setFiltroAssociado}>
              <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os associados</SelectItem>
                {associados.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tipo de matéria-prima</p>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-9 w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os tipos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {temFiltro && (
            <Button variant="ghost" size="sm" className="h-9"
              onClick={() => { setFiltroAssociado(TODOS); setFiltroTipo(TODOS) }}>
              <X className="h-3.5 w-3.5" /> Limpar filtros
            </Button>
          )}
        </div>
        <Button size="sm" onClick={() => setColheitaOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Registrar Colheita
        </Button>
      </div>

      <DataTable
        data={filtradas} columns={cols} rowKey={(r) => r.id} isLoading={isLoading}
        emptyTitle="Nenhuma colheita encontrada"
        emptyDescription={temFiltro ? 'Nenhuma colheita corresponde aos filtros selecionados.' : 'As colheitas aparecerão aqui após serem registradas.'}
      />

      <RegistrarColheitaDialog open={colheitaOpen} onOpenChange={setColheitaOpen} />
    </div>
  )
}
