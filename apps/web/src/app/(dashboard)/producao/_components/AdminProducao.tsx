'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { AlertCircle, Package, Plus, Trash2, X } from 'lucide-react'
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
import { useColheitas, useEstoquePool, useTiposMateriaPrima, useDeletarTipoMateriaPrima, useDeletarColheita, useDeletarItemPool } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import { useCampanhas } from '@/hooks/useCampanhas'
import { DataTable, EmptyState, type Column } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ColheitaResponse } from '@/lib/api/producao'
import { Badge } from '@/components/ui/badge'
import { RegistrarColheitaDialog } from './RegistrarColheitaDialog'
import { CriarTipoMateriaPrimaDialog } from './CriarTipoMateriaPrimaDialog'

// Sentinel value para "sem filtro" — evita o problema de value="" no Radix Select
const TODOS = '__todos__'

// ---------- Aba Colheitas ----------

function ColheitasTab() {
  const { data: colheitas = [], isLoading } = useColheitas()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { data: associados = [] } = useAssociados()
  const { data: campanhas = [] } = useCampanhas()
  const { mutate: deletar, isPending: deletando } = useDeletarColheita()

  const [filtroAssociado, setFiltroAssociado] = React.useState(TODOS)
  const [filtroTipo, setFiltroTipo] = React.useState(TODOS)
  const [colheitaOpen, setColheitaOpen] = React.useState(false)

  function handleDeletar(id: string) {
    deletar(id, {
      onSuccess: () => toast.success('Colheita removida.'),
      onError: (e) => toast.error((e as { message?: string }).message ?? 'Erro ao remover colheita.'),
    })
  }

  const temFiltro = filtroAssociado !== TODOS || filtroTipo !== TODOS

  const tipoNome = (id: string) => tipos.find(t => t.id === id)?.nome ?? '—'
  const associadoNome = (id: string) => associados.find(a => a.id === id)?.usuario.nome ?? id.slice(0, 8)
  const campanhaNome = (id?: string) => id ? campanhas.find(c => c.id === id)?.nome ?? id.slice(0, 8) : null

  const filtradas = React.useMemo(() => colheitas.filter(c => {
    if (filtroAssociado !== TODOS && c.associadoId !== filtroAssociado) return false
    if (filtroTipo !== TODOS && c.tipoMateriaPrimaId !== filtroTipo) return false
    return true
  }), [colheitas, filtroAssociado, filtroTipo])

  const cols: Column<ColheitaResponse>[] = [
    {
      key: 'associadoId',
      label: 'Associado',
      render: (r) => associadoNome(r.associadoId),
    },
    {
      key: 'tipoMateriaPrimaId',
      label: 'Tipo',
      render: (r) => tipoNome(r.tipoMateriaPrimaId),
    },
    {
      key: 'volume',
      label: 'Volume',
      render: (r) => `${r.volume} ${r.unidade}`,
    },
    {
      key: 'dataColheita',
      label: 'Data',
      render: (r) => format(new Date(r.dataColheita), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'campanhaId',
      label: 'Destino',
      render: (r) => {
        const nome = campanhaNome(r.campanhaId)
        return nome
          ? <span className="font-medium">{nome}</span>
          : <span className="text-muted-foreground text-xs">Pool geral</span>
      },
    },
    {
      key: 'observacao',
      label: 'Obs',
      render: (r) => r.observacao ?? '—',
    },
    {
      key: 'id',
      label: '',
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
                onClick={() => handleDeletar(r.id)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ]

  function limparFiltros() {
    setFiltroAssociado(TODOS)
    setFiltroTipo(TODOS)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex flex-wrap gap-3 flex-1 items-end">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Associado</p>
            <Select value={filtroAssociado} onValueChange={setFiltroAssociado}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os associados</SelectItem>
                {associados.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tipo de matéria-prima</p>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-9 w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os tipos</SelectItem>
                {tipos.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {temFiltro && (
            <Button variant="ghost" size="sm" className="h-9" onClick={limparFiltros}>
              <X className="h-3.5 w-3.5" /> Limpar filtros
            </Button>
          )}
        </div>
        <Button size="sm" onClick={() => setColheitaOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Registrar Colheita
        </Button>
      </div>

      <DataTable
        data={filtradas}
        columns={cols}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="Nenhuma colheita encontrada"
        emptyDescription={
          temFiltro
            ? 'Nenhuma colheita corresponde aos filtros selecionados.'
            : 'As colheitas aparecerão aqui após serem registradas.'
        }
      />

      <RegistrarColheitaDialog open={colheitaOpen} onOpenChange={setColheitaOpen} />
    </div>
  )
}

// ---------- Aba Tipos de Matéria-Prima ----------

function TiposTab() {
  const { data: tipos = [], isLoading } = useTiposMateriaPrima()
  const { mutate: deletar, isPending: deletando } = useDeletarTipoMateriaPrima()
  const [criarOpen, setCriarOpen] = React.useState(false)

  function handleDelete(id: string) {
    deletar(id, {
      onSuccess: () => toast.success('Tipo removido.'),
      onError: (e) => toast.error((e as { message?: string }).message ?? 'Erro ao remover tipo.'),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCriarOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo Tipo
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : tipos.length === 0 ? (
        <EmptyState
          title="Nenhum tipo cadastrado"
          description="Cadastre os tipos de matéria-prima que os associados podem colher (mel, cera, própolis…)."
          className="py-8"
          action={
            <Button size="sm" onClick={() => setCriarOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Cadastrar primeiro tipo
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Nome</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Unidade</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Descrição</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium px-4 py-3">{t.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground px-4 py-3">{t.unidade}</TableCell>
                  <TableCell className="text-sm text-muted-foreground px-4 py-3">{t.descricao ?? '—'}</TableCell>
                  <TableCell className="px-2 py-2 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deletando}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover tipo de matéria-prima?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O tipo <strong>{t.nome}</strong> e todos os dados vinculados (colheitas, estoque e movimentações) serão removidos permanentemente. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(t.id)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CriarTipoMateriaPrimaDialog open={criarOpen} onOpenChange={setCriarOpen} />
    </div>
  )
}

// ---------- Aba Pool ----------

function PoolTab() {
  const { data: pool = [], isLoading } = useEstoquePool()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutate: deletarPool, isPending: deletando } = useDeletarItemPool()

  const tipoNome = (id: string) => tipos.find(t => t.id === id)?.nome ?? id.slice(0, 8)

  function handleDeletarPool(tipoId: string) {
    deletarPool(tipoId, {
      onSuccess: () => toast.success('Item removido do pool.'),
      onError: (e) => toast.error((e as { message?: string }).message ?? 'Erro ao remover item.'),
    })
  }

  const saldoBadge = (qtd: number) => {
    if (qtd <= 0) return <Badge variant="destructive">Sem saldo</Badge>
    if (qtd < 5) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Baixo</Badge>
    return <Badge variant="secondary" className="text-green-700 bg-green-50">Disponível</Badge>
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />

  if (pool.length === 0) {
    return (
      <EmptyState
        title="Pool vazio"
        description="Nenhuma matéria-prima disponível no pool. Registre colheitas sem campanha para alimentar o estoque compartilhado."
        className="py-8"
        icon={AlertCircle}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Estoque compartilhado alimentado por colheitas sem campanha (RN14). Consumido por ordens de produção (RN15).
      </p>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b-0">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Saldo</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Unidade</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pool.map(item => (
              <TableRow key={item.tipoMateriaPrimaId}>
                <TableCell className="font-medium px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {tipoNome(item.tipoMateriaPrimaId)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 tabular-nums">
                  {item.quantidadeDisponivel.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground px-4 py-3">{item.unidade}</TableCell>
                <TableCell className="px-4 py-3">{saldoBadge(item.quantidadeDisponivel)}</TableCell>
                <TableCell className="px-2 py-2 text-right">
                  {item.quantidadeDisponivel === 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deletando}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover item do pool?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O registro de <strong>{tipoNome(item.tipoMateriaPrimaId)}</strong> com saldo zero será removido do pool. Novas colheitas desse tipo criarão um novo registro automaticamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeletarPool(item.tipoMateriaPrimaId)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ---------- Componente principal ----------

export function AdminProducao() {
  return (
    <Tabs defaultValue="colheitas">
      <TabsList>
        <TabsTrigger value="colheitas">Colheitas</TabsTrigger>
        <TabsTrigger value="pool">Pool de Estoque</TabsTrigger>
        <TabsTrigger value="tipos">Tipos de Matéria-Prima</TabsTrigger>
      </TabsList>
      <TabsContent value="colheitas" className="mt-4">
        <ColheitasTab />
      </TabsContent>
      <TabsContent value="pool" className="mt-4">
        <PoolTab />
      </TabsContent>
      <TabsContent value="tipos" className="mt-4">
        <TiposTab />
      </TabsContent>
    </Tabs>
  )
}
