'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, MoreHorizontal, Wrench, UserCheck, Undo2, Trash2, Check, X, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  useEquipamentos,
  useColocarEquipamentoEmManutencao,
  useLiberarEquipamentoManutencao,
  useExcluirEquipamento,
} from '@/hooks/useEquipamentos'
import {
  useTiposInsumo,
  useInsumos,
  useColocarInsumoEmManutencao,
  useLiberarInsumoManutencao,
  useExcluirInsumo,
  useExcluirTipoInsumo,
} from '@/hooks/useInsumos'
import { useAssociados } from '@/hooks/useAssociados'
import { useTodasAtribuicoes, useAtribuirPatrimonio, useDevolverPatrimonio } from '@/hooks/useAtribuicoes'
import { useSolicitacoes, useAprovarSolicitacao, useRejeitarSolicitacao } from '@/hooks/useSolicitacoes'
import { DataTable, StatusBadge, ConfirmDialog, ViewToggle, type Column } from '@/components/shared'
import { useViewToggle } from '@/hooks/useViewToggle'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type {
  EquipamentoResponse,
  TipoInsumoResponse,
  InsumoResponse,
  SolicitacaoPatrimonioResponse,
} from '@/lib/api/patrimonio'
import { EquipamentoFormDialog } from './EquipamentoFormDialog'
import { TipoInsumoFormDialog } from './TipoInsumoFormDialog'
import { AdicionarUnidadesDialog } from './AdicionarUnidadesDialog'

const LABEL_CATEGORIA: Record<string, string> = { FERRAMENTA: 'Ferramenta', INSUMO: 'Insumo' }
const LABEL_TIPO: Record<string, string> = { EQUIPAMENTO: 'Equipamento', INSUMO: 'Insumo' }

type AtribuirTarget = { id: string; tipoPatrimonio: 'EQUIPAMENTO' | 'INSUMO'; nome: string }
type ExcluirTarget = { tipo: 'equipamento' | 'insumo' | 'tipo-insumo'; id: string; nome: string }
type AcaoConfirm = { tipo: 'aprovar' | 'rejeitar'; solicitacao: SolicitacaoPatrimonioResponse; nome: string }

function AtribuirDialog({
  target, onClose, associados, onConfirm,
}: {
  target: AtribuirTarget | null
  onClose: () => void
  associados: Array<{ id: string; usuario: { nome: string } }>
  onConfirm: (associadoId: string, observacao?: string) => Promise<void>
}) {
  const [associadoId, setAssociadoId] = React.useState('')
  const [observacao, setObservacao] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (target) { setAssociadoId(''); setObservacao('') }
  }, [target])

  const handle = async () => {
    if (!associadoId) { toast.error('Selecione um associado.'); return }
    setLoading(true)
    try { await onConfirm(associadoId, observacao || undefined) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir — {target?.nome}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Associado</Label>
            <Select value={associadoId} onValueChange={setAssociadoId}>
              <SelectTrigger><SelectValue placeholder="Selecione um associado ativo" /></SelectTrigger>
              <SelectContent>
                {associados.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)}
              placeholder="Instruções ou observações…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handle} disabled={loading}>
            <UserCheck className="mr-2 h-4 w-4" />Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminInsumos() {
  const { data: equipamentos = [], isLoading: loadingEq } = useEquipamentos()
  const { data: tiposInsumo = [], isLoading: loadingTipos } = useTiposInsumo()
  const { data: insumos = [], isLoading: loadingUnidades } = useInsumos()
  const { data: associados = [] } = useAssociados()
  const { data: atribuicoes = [] } = useTodasAtribuicoes()
  const { data: solicitacoes = [], isLoading: loadingSol } = useSolicitacoes()

  const { mutateAsync: manutencaoEq } = useColocarEquipamentoEmManutencao()
  const { mutateAsync: liberarEq } = useLiberarEquipamentoManutencao()
  const { mutateAsync: excluirEq } = useExcluirEquipamento()
  const { mutateAsync: excluirTipo } = useExcluirTipoInsumo()
  const { mutateAsync: manutencaoIns } = useColocarInsumoEmManutencao()
  const { mutateAsync: liberarIns } = useLiberarInsumoManutencao()
  const { mutateAsync: excluirIns } = useExcluirInsumo()
  const { mutateAsync: atribuir } = useAtribuirPatrimonio()
  const { mutateAsync: devolver } = useDevolverPatrimonio()
  const { mutateAsync: aprovar, isPending: aprovando } = useAprovarSolicitacao()
  const { mutateAsync: rejeitar, isPending: rejeitando } = useRejeitarSolicitacao()

  const [eqForm, setEqForm] = React.useState<{ open: boolean; item?: EquipamentoResponse }>({ open: false })
  const [tipoForm, setTipoForm] = React.useState<{ open: boolean; item?: TipoInsumoResponse }>({ open: false })
  const [adicionarTarget, setAdicionarTarget] = React.useState<TipoInsumoResponse | null>(null)
  const [atribuirTarget, setAtribuirTarget] = React.useState<AtribuirTarget | null>(null)
  const [excluirTarget, setExcluirTarget] = React.useState<ExcluirTarget | null>(null)
  const [acaoConfirm, setAcaoConfirm] = React.useState<AcaoConfirm | null>(null)
  const [filtroTipoId, setFiltroTipoId] = React.useState<string>('todos')

  const [eqView, setEqView] = useViewToggle('insumos-eq')

  const disponiveisPorTipo = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const ins of insumos) {
      if (ins.status === 'DISPONIVEL') map[ins.tipoInsumoId] = (map[ins.tipoInsumoId] ?? 0) + 1
    }
    return map
  }, [insumos])

  const totalPorTipo = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const ins of insumos) map[ins.tipoInsumoId] = (map[ins.tipoInsumoId] ?? 0) + 1
    return map
  }, [insumos])

  const unidadesFiltradas = filtroTipoId === 'todos' ? insumos : insumos.filter((i) => i.tipoInsumoId === filtroTipoId)
  const pendentes = solicitacoes.filter((s) => s.status === 'PENDENTE')
  const atribuicaoAtiva = (id: string) => atribuicoes.find((a) => a.patrimonioId === id && a.status === 'ATIVO')
  const associadoNome = (id: string) => associados.find((a) => a.id === id)?.usuario.nome ?? id

  const solicitacaoNome = (r: SolicitacaoPatrimonioResponse) => {
    if (r.tipoPatrimonio === 'EQUIPAMENTO') return equipamentos.find((e) => e.id === r.patrimonioId)?.nome ?? '—'
    const tipo = tiposInsumo.find((t) => t.id === r.tipoInsumoId)
    return tipo ? `${tipo.nome} × ${r.quantidade}` : `Insumo × ${r.quantidade}`
  }

  const handleAtribuir = async (associadoId: string, observacao?: string) => {
    if (!atribuirTarget) return
    try {
      await atribuir({ patrimonioId: atribuirTarget.id, tipoPatrimonio: atribuirTarget.tipoPatrimonio, associadoId, observacao })
      toast.success(`"${atribuirTarget.nome}" atribuído com sucesso.`)
      setAtribuirTarget(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atribuir.')
    }
  }

  const handleDevolver = async (patrimonioId: string, nome: string) => {
    const ativa = atribuicaoAtiva(patrimonioId)
    if (!ativa) { toast.error('Atribuição ativa não encontrada.'); return }
    try { await devolver(ativa.id); toast.success(`Devolução de "${nome}" registrada.`) }
    catch { toast.error('Erro ao registrar devolução.') }
  }

  const handleManutencaoEq = async (id: string, nome: string, marcar: boolean) => {
    try {
      marcar ? await manutencaoEq(id) : await liberarEq(id)
      toast.success(marcar ? `"${nome}" enviado para manutenção.` : `"${nome}" liberado da manutenção.`)
    } catch { toast.error('Erro ao atualizar status.') }
  }

  const handleManutencaoIns = async (id: string, nome: string, marcar: boolean) => {
    try {
      marcar ? await manutencaoIns(id) : await liberarIns(id)
      toast.success(marcar ? `"${nome}" enviado para manutenção.` : `"${nome}" liberado da manutenção.`)
    } catch { toast.error('Erro ao atualizar status.') }
  }

  const handleExcluir = async () => {
    if (!excluirTarget) return
    try {
      if (excluirTarget.tipo === 'equipamento') await excluirEq(excluirTarget.id)
      else if (excluirTarget.tipo === 'insumo') await excluirIns(excluirTarget.id)
      else await excluirTipo(excluirTarget.id)
      toast.success(`"${excluirTarget.nome}" excluído.`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir.')
    } finally { setExcluirTarget(null) }
  }

  const handleAcao = async () => {
    if (!acaoConfirm) return
    const { tipo, solicitacao, nome } = acaoConfirm
    try {
      if (tipo === 'aprovar') { await aprovar(solicitacao.id); toast.success(`Solicitação de "${nome}" aprovada.`) }
      else { await rejeitar(solicitacao.id); toast.success(`Solicitação de "${nome}" rejeitada.`) }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Erro ao ${tipo} solicitação.`)
    } finally { setAcaoConfirm(null) }
  }

  // ─── Columns ─────────────────────────────────────────────────────────────────

  const eqColumns: Column<EquipamentoResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'numeroSerie', label: 'N° Série', render: (r) => r.numeroSerie ?? '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'emUsoPor', label: 'Em uso por',
      render: (r) => {
        const ativa = atribuicaoAtiva(r.id)
        return ativa ? <span className="text-sm">{associadoNome(ativa.associadoId)}</span> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      key: 'acoes', label: '', className: 'w-32 text-right',
      render: (r) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEqForm({ open: true, item: r })}>Editar</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {r.status === 'DISPONIVEL' && (
                <DropdownMenuItem onClick={() => setAtribuirTarget({ id: r.id, tipoPatrimonio: 'EQUIPAMENTO', nome: r.nome })}>
                  <UserCheck className="mr-2 h-4 w-4" />Atribuir a associado
                </DropdownMenuItem>
              )}
              {r.status === 'EM_USO' && (
                <DropdownMenuItem onClick={() => handleDevolver(r.id, r.nome)}>
                  <Undo2 className="mr-2 h-4 w-4" />Registrar devolução
                </DropdownMenuItem>
              )}
              {r.status !== 'MANUTENCAO' ? (
                <DropdownMenuItem onClick={() => handleManutencaoEq(r.id, r.nome, true)}>
                  <Wrench className="mr-2 h-4 w-4" />Marcar manutenção
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleManutencaoEq(r.id, r.nome, false)}>
                  <Wrench className="mr-2 h-4 w-4" />Liberar manutenção
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive"
                onClick={() => setExcluirTarget({ tipo: 'equipamento', id: r.id, nome: r.nome })}>
                <Trash2 className="mr-2 h-4 w-4" />Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const tipoColumns: Column<TipoInsumoResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria', render: (r) => LABEL_CATEGORIA[r.categoria] ?? r.categoria },
    { key: 'sigla', label: 'Sigla', render: (r) => <span className="font-mono text-sm">{r.sigla}</span> },
    {
      key: 'unidades', label: 'Unidades',
      render: (r) => (
        <span className="text-sm">
          {disponiveisPorTipo[r.id] ?? 0} disp. / {totalPorTipo[r.id] ?? 0} total
        </span>
      ),
    },
    {
      key: 'acoes', label: '', className: 'w-44 text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setAdicionarTarget(r)}>
            <PackagePlus className="h-3.5 w-3.5 mr-1" />Adicionar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTipoForm({ open: true, item: r })}>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive"
                onClick={() => setExcluirTarget({ tipo: 'tipo-insumo', id: r.id, nome: r.nome })}>
                <Trash2 className="mr-2 h-4 w-4" />Excluir tipo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const unidadeColumns: Column<InsumoResponse>[] = [
    { key: 'identificador', label: 'Identificador', render: (r) => <span className="font-mono text-sm">{r.identificador}</span> },
    { key: 'tipo', label: 'Tipo', render: (r) => r.tipoInsumo.nome },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'emUsoPor', label: 'Em uso por',
      render: (r) => {
        const ativa = atribuicaoAtiva(r.id)
        return ativa ? <span className="text-sm">{associadoNome(ativa.associadoId)}</span> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      key: 'acoes', label: '', className: 'w-12 text-right',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {r.status === 'DISPONIVEL' && (
              <DropdownMenuItem onClick={() => setAtribuirTarget({ id: r.id, tipoPatrimonio: 'INSUMO', nome: r.identificador })}>
                <UserCheck className="mr-2 h-4 w-4" />Atribuir a associado
              </DropdownMenuItem>
            )}
            {r.status === 'EM_USO' && (
              <DropdownMenuItem onClick={() => handleDevolver(r.id, r.identificador)}>
                <Undo2 className="mr-2 h-4 w-4" />Registrar devolução
              </DropdownMenuItem>
            )}
            {r.status !== 'MANUTENCAO' ? (
              <DropdownMenuItem onClick={() => handleManutencaoIns(r.id, r.identificador, true)}>
                <Wrench className="mr-2 h-4 w-4" />Marcar manutenção
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleManutencaoIns(r.id, r.identificador, false)}>
                <Wrench className="mr-2 h-4 w-4" />Liberar manutenção
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive"
              onClick={() => setExcluirTarget({ tipo: 'insumo', id: r.id, nome: r.identificador })}>
              <Trash2 className="mr-2 h-4 w-4" />Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const solicitacaoCols: Column<SolicitacaoPatrimonioResponse>[] = [
    {
      key: 'patrimonio', label: 'Patrimônio',
      render: (r) => (
        <div>
          <p className="font-medium">{solicitacaoNome(r)}</p>
          <p className="text-xs text-muted-foreground">{LABEL_TIPO[r.tipoPatrimonio] ?? r.tipoPatrimonio}</p>
        </div>
      ),
    },
    { key: 'associado', label: 'Solicitante', render: (r) => associadoNome(r.associadoId) },
    {
      key: 'justificativa', label: 'Justificativa',
      render: (r) => r.justificativa
        ? <span className="text-sm text-muted-foreground line-clamp-2">{r.justificativa}</span>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'criadoEm', label: 'Solicitado em',
      render: (r) => format(new Date(r.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'acoes', label: '', className: 'w-44 text-right',
      render: (r) => r.status === 'PENDENTE' ? (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-600"
            disabled={aprovando || rejeitando}
            onClick={() => setAcaoConfirm({ tipo: 'aprovar', solicitacao: r, nome: solicitacaoNome(r) })}>
            <Check className="h-3.5 w-3.5 mr-1" />Aprovar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            disabled={aprovando || rejeitando}
            onClick={() => setAcaoConfirm({ tipo: 'rejeitar', solicitacao: r, nome: solicitacaoNome(r) })}>
            <X className="h-3.5 w-3.5 mr-1" />Rejeitar
          </Button>
        </div>
      ) : null,
    },
  ]

  return (
    <>
      <Tabs defaultValue="equipamentos">
        <TabsList className="mb-6">
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Insumo</TabsTrigger>
          <TabsTrigger value="unidades">Unidades</TabsTrigger>
          <TabsTrigger value="solicitacoes" className="relative">
            Solicitações
            {pendentes.length > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">
                {pendentes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos" className="space-y-4">
          <div className="flex items-center justify-between">
            <ViewToggle view={eqView} onViewChange={setEqView} />
            <Button size="sm" onClick={() => setEqForm({ open: true })}>
              <Plus className="h-4 w-4 mr-1" />Novo Equipamento
            </Button>
          </div>
          {eqView === 'grid' ? (
            loadingEq ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <div key={i} className="rounded-xl border p-4 h-36 animate-pulse bg-muted/30" />)}
              </div>
            ) : equipamentos.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-10">Nenhum equipamento cadastrado.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {equipamentos.map((r) => {
                  const ativa = atribuicaoAtiva(r.id)
                  return (
                    <div key={r.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={r.status} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.nome}</p>
                        {r.numeroSerie && <p className="text-xs text-muted-foreground mt-0.5">Série: {r.numeroSerie}</p>}
                      </div>
                      <div className="border-t pt-2.5">
                        <p className="text-[11px] text-muted-foreground mb-0.5">Em uso por</p>
                        <p className="text-sm font-medium">{ativa ? associadoNome(ativa.associadoId) : '—'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <DataTable data={equipamentos} columns={eqColumns} rowKey={(r) => r.id}
              isLoading={loadingEq} searchable searchPlaceholder="Buscar equipamento..."
              searchKeys={['nome', 'numeroSerie']} emptyTitle="Nenhum equipamento cadastrado" />
          )}
        </TabsContent>

        <TabsContent value="tipos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setTipoForm({ open: true })}>
              <Plus className="h-4 w-4 mr-1" />Novo Tipo
            </Button>
          </div>
          <DataTable data={tiposInsumo} columns={tipoColumns} rowKey={(r) => r.id}
            isLoading={loadingTipos} searchable searchPlaceholder="Buscar tipo de insumo..."
            searchKeys={['nome', 'sigla']} emptyTitle="Nenhum tipo de insumo cadastrado" />
        </TabsContent>

        <TabsContent value="unidades" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={filtroTipoId} onValueChange={setFiltroTipoId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Filtrar por tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposInsumo.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable data={unidadesFiltradas} columns={unidadeColumns} rowKey={(r) => r.id}
            isLoading={loadingUnidades} searchable searchPlaceholder="Buscar por identificador..."
            searchKeys={['identificador']} emptyTitle="Nenhuma unidade cadastrada" />
        </TabsContent>

        <TabsContent value="solicitacoes">
          <DataTable data={solicitacoes} columns={solicitacaoCols} rowKey={(r) => r.id}
            isLoading={loadingSol} emptyTitle="Nenhuma solicitação encontrada" />
        </TabsContent>
      </Tabs>

      <EquipamentoFormDialog open={eqForm.open} onOpenChange={(o) => setEqForm({ open: o })} equipamento={eqForm.item} />
      <TipoInsumoFormDialog open={tipoForm.open} onOpenChange={(o) => setTipoForm({ open: o })} tipoInsumo={tipoForm.item} />
      <AdicionarUnidadesDialog open={!!adicionarTarget} onOpenChange={(o) => { if (!o) setAdicionarTarget(null) }} tipoInsumo={adicionarTarget} />

      <AtribuirDialog target={atribuirTarget} onClose={() => setAtribuirTarget(null)}
        associados={associados} onConfirm={handleAtribuir} />

      <ConfirmDialog
        open={excluirTarget !== null}
        onOpenChange={(o) => { if (!o) setExcluirTarget(null) }}
        title="Excluir item"
        description={`Tem certeza que deseja excluir "${excluirTarget?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir" variant="destructive" onConfirm={handleExcluir} />

      <ConfirmDialog
        open={acaoConfirm !== null}
        onOpenChange={(o) => { if (!o) setAcaoConfirm(null) }}
        title={acaoConfirm?.tipo === 'aprovar' ? 'Aprovar solicitação' : 'Rejeitar solicitação'}
        description={
          acaoConfirm?.tipo === 'aprovar'
            ? `Confirma a aprovação da solicitação de "${acaoConfirm?.nome}"?`
            : `Confirma a rejeição da solicitação de "${acaoConfirm?.nome}"?`
        }
        confirmLabel={acaoConfirm?.tipo === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
        variant={acaoConfirm?.tipo === 'rejeitar' ? 'destructive' : 'default'}
        onConfirm={handleAcao} />
    </>
  )
}
