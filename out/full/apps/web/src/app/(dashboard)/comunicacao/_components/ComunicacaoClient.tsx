'use client'

import * as React from 'react'
import {
  Plus, Eye, EyeOff, Megaphone, Bell, Pin, Trash2,
  MessageSquare, Droplets, Users, CheckCircle2, Circle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { StatusBadge, ConfirmDialog, DataTable, type Column } from '@/components/shared'
import {
  useAvisos,
  useCriarAviso,
  useDespublicarAviso,
  useExcluirAviso,
  usePublicarAviso,
  useSolicitacoesContato,
  useAtualizarStatusSolicitacaoContato,
  useExcluirSolicitacaoContato,
} from '@/hooks/useComunicacao'
import { useCriarAssociadoPendente } from '@/hooks/useAssociados'
import type { AvisoResponse, SolicitacaoContatoResponse, StatusSolicitacaoContato } from '@/lib/api/comunicacao'

// ─── Estilos ─────────────────────────────────────────────────────────────────

const CAT_STYLE: Record<string, { label: string; className: string }> = {
  GERAL:      { label: 'Geral',      className: 'bg-muted text-muted-foreground' },
  URGENTE:    { label: 'Urgente',    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  REUNIAO:    { label: 'Reunião',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  FINANCEIRO: { label: 'Financeiro', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

const TIPO_SOL: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  CONTATO:    { label: 'Mensagem',          Icon: MessageSquare },
  COLETA:     { label: 'Solicitação de Coleta', Icon: Droplets },
  INTEGRACAO: { label: 'Quero me Associar', Icon: Users },
}

const STATUS_SOL: Record<StatusSolicitacaoContato, { label: string; Icon: React.ComponentType<{ className?: string }>; className: string }> = {
  PENDENTE:    { label: 'Pendente',    Icon: Circle,        className: 'text-amber-600' },
  VISUALIZADA: { label: 'Visualizada', Icon: Eye,           className: 'text-blue-600' },
  RESOLVIDA:   { label: 'Resolvida',   Icon: CheckCircle2,  className: 'text-green-600' },
}

// ─── Dialog de criação de aviso ───────────────────────────────────────────────

function NovoAvisoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = React.useState({ titulo: '', conteudo: '', categoria: 'GERAL', fixado: false })
  const { mutateAsync: criar, isPending } = useCriarAviso()

  function handleOpenChange(v: boolean) {
    if (isPending) return
    onOpenChange(v)
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await criar({ titulo: form.titulo, conteudo: form.conteudo, categoria: form.categoria, fixado: form.fixado })
      toast.success('Aviso criado com sucesso.')
      setForm({ titulo: '', conteudo: '', categoria: 'GERAL', fixado: false })
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar aviso.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Aviso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              required minLength={3} placeholder="Título do aviso" disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => setForm((p) => ({ ...p, categoria: v }))}
              disabled={isPending}
            >
              <SelectTrigger id="categoria"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GERAL">Geral</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
                <SelectItem value="REUNIAO">Reunião</SelectItem>
                <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            <Textarea
              id="conteudo" rows={5} value={form.conteudo}
              onChange={(e) => setForm((p) => ({ ...p, conteudo: e.target.value }))}
              required minLength={10} placeholder="Texto do aviso para os associados..."
              disabled={isPending} className="resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="fixado" checked={form.fixado}
              onCheckedChange={(v) => setForm((p) => ({ ...p, fixado: v }))}
              disabled={isPending}
            />
            <Label htmlFor="fixado" className="cursor-pointer">Fixar aviso no topo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar Aviso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Card de aviso ────────────────────────────────────────────────────────────

function AvisoCard({ aviso }: { aviso: AvisoResponse }) {
  const cat = CAT_STYLE[aviso.categoria] ?? CAT_STYLE.GERAL
  const dataFormatada = format(new Date(aviso.criadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const { mutateAsync: publicar, isPending: publicando } = usePublicarAviso()
  const { mutateAsync: despublicar, isPending: despublicando } = useDespublicarAviso()
  const { mutateAsync: excluir, isPending: excluindo } = useExcluirAviso()
  const [confirmExcluir, setConfirmExcluir] = React.useState(false)
  const isPending = publicando || despublicando || excluindo

  async function handleToggle() {
    try {
      if (aviso.publicado) {
        await despublicar(aviso.id)
        toast.success('Aviso despublicado.')
      } else {
        await publicar(aviso.id)
        toast.success('Aviso publicado.')
      }
    } catch { toast.error('Erro ao atualizar aviso.') }
  }

  async function handleExcluir() {
    try {
      await excluir(aviso.id)
      toast.success('Aviso excluído.')
    } catch { toast.error('Erro ao excluir aviso.') }
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border bg-card p-5 space-y-3 transition-shadow hover:shadow-sm',
        !aviso.publicado && 'opacity-60',
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {aviso.fixado && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cat.className)}>
              {cat.label}
            </span>
            <StatusBadge status={aviso.publicado ? 'PUBLICADO' : 'RASCUNHO'} />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground"
              onClick={handleToggle} disabled={isPending}>
              {aviso.publicado
                ? <><EyeOff className="h-3.5 w-3.5 mr-1" />Despublicar</>
                : <><Eye className="h-3.5 w-3.5 mr-1" />Publicar</>}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive"
              onClick={() => setConfirmExcluir(true)} disabled={isPending}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold leading-snug">{aviso.titulo}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">{aviso.conteudo}</p>
        </div>

        <p className="text-xs text-muted-foreground">{dataFormatada}</p>
      </div>

      <ConfirmDialog
        open={confirmExcluir} onOpenChange={setConfirmExcluir}
        title="Excluir aviso"
        description={`Deseja excluir o aviso "${aviso.titulo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir" variant="destructive"
        onConfirm={handleExcluir} isPending={excluindo}
      />
    </>
  )
}

// ─── Painel de solicitações de contato ───────────────────────────────────────

function SolicitacoesContatoPanel() {
  const [filtroStatus, setFiltroStatus] = React.useState<StatusSolicitacaoContato | 'TODOS'>('TODOS')
  const [detalhe, setDetalhe] = React.useState<SolicitacaoContatoResponse | null>(null)
  const [excluirConfirm, setExcluirConfirm] = React.useState<SolicitacaoContatoResponse | null>(null)

  const status = filtroStatus === 'TODOS' ? undefined : filtroStatus
  const { data: solicitacoes = [], isLoading } = useSolicitacoesContato(status)
  const { mutateAsync: atualizarStatus, isPending: atualizando } = useAtualizarStatusSolicitacaoContato()
  const { mutateAsync: excluir, isPending: excluindo } = useExcluirSolicitacaoContato()
  const { mutateAsync: colocarNaLista, isPending: colocando } = useCriarAssociadoPendente()

  const pendentes = solicitacoes.filter((s) => s.status === 'PENDENTE').length

  async function handleAtualizarStatus(id: string, novoStatus: StatusSolicitacaoContato) {
    try {
      await atualizarStatus({ id, status: novoStatus })
      toast.success('Status atualizado.')
      if (detalhe?.id === id) setDetalhe((p) => p ? { ...p, status: novoStatus } : null)
    } catch { toast.error('Erro ao atualizar status.') }
  }

  async function handleExcluir() {
    if (!excluirConfirm) return
    try {
      await excluir(excluirConfirm.id)
      toast.success('Solicitação excluída.')
      if (detalhe?.id === excluirConfirm.id) setDetalhe(null)
    } catch { toast.error('Erro ao excluir.') }
    finally { setExcluirConfirm(null) }
  }

  async function handleColocarNaLista(sol: SolicitacaoContatoResponse) {
    try {
      await colocarNaLista({ nome: sol.nome, email: sol.email, telefone: sol.telefone ?? undefined, observacoes: sol.mensagem })
      await atualizarStatus({ id: sol.id, status: 'RESOLVIDA' })
      toast.success(`${sol.nome} adicionado à lista de pendentes.`)
      setDetalhe(null)
    } catch { toast.error('Erro ao colocar na lista.') }
  }

  const cols: Column<SolicitacaoContatoResponse>[] = [
    {
      key: 'tipo', label: 'Tipo',
      render: (r) => {
        const t = TIPO_SOL[r.tipo]
        return t ? (
          <div className="flex items-center gap-1.5">
            <t.Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">{t.label}</span>
          </div>
        ) : r.tipo
      },
    },
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail', render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    {
      key: 'status', label: 'Status',
      render: (r) => {
        const st = STATUS_SOL[r.status]
        return st ? (
          <div className={cn('flex items-center gap-1.5 text-sm font-medium', st.className)}>
            <st.Icon className="h-3.5 w-3.5" />{st.label}
          </div>
        ) : <StatusBadge status={r.status} />
      },
    },
    {
      key: 'criadoEm', label: 'Data',
      render: (r) => format(new Date(r.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    },
    {
      key: 'acoes', label: '', className: 'w-32 text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetalhe(r)}>Ver</Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => setExcluirConfirm(r)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filtro */}
      <div className="flex items-center gap-2">
        <Tabs value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}>
          <TabsList>
            <TabsTrigger value="TODOS">
              Todas
              {pendentes > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">
                  {pendentes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="PENDENTE">Pendentes</TabsTrigger>
            <TabsTrigger value="VISUALIZADA">Visualizadas</TabsTrigger>
            <TabsTrigger value="RESOLVIDA">Resolvidas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        data={solicitacoes} columns={cols} rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="Nenhuma solicitação encontrada"
      />

      {/* Dialog de detalhe */}
      <Dialog open={detalhe !== null} onOpenChange={(o) => { if (!o) setDetalhe(null) }}>
        {detalhe && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => { const t = TIPO_SOL[detalhe.tipo]; return t ? <><t.Icon className="h-4 w-4" />{t.label}</> : detalhe.tipo })()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{detalhe.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{detalhe.email}</p>
                </div>
                {detalhe.telefone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{detalhe.telefone}</p>
                  </div>
                )}
                {detalhe.localizacao && (
                  <div>
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="font-medium">{detalhe.localizacao}</p>
                  </div>
                )}
                {detalhe.municipio && (
                  <div>
                    <p className="text-xs text-muted-foreground">Município</p>
                    <p className="font-medium">{detalhe.municipio}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Recebida em</p>
                  <p className="font-medium">{format(new Date(detalhe.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Mensagem</p>
                <p className="rounded-lg bg-muted/50 p-3 leading-relaxed">{detalhe.mensagem}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <p className="text-xs text-muted-foreground mr-1">Status:</p>
                {detalhe.status !== 'VISUALIZADA' && (
                  <Button size="sm" variant="outline" disabled={atualizando || colocando}
                    onClick={() => handleAtualizarStatus(detalhe.id, 'VISUALIZADA')}>
                    <Eye className="h-3.5 w-3.5 mr-1" />Marcar como Visualizada
                  </Button>
                )}
                {detalhe.tipo === 'INTEGRACAO' && detalhe.status !== 'RESOLVIDA' && (
                  <Button size="sm" variant="outline" disabled={atualizando || colocando}
                    onClick={() => handleColocarNaLista(detalhe)}>
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {colocando ? 'Adicionando...' : 'Colocar na lista'}
                  </Button>
                )}
                {detalhe.status !== 'RESOLVIDA' && (
                  <Button size="sm" disabled={atualizando || colocando}
                    onClick={() => handleAtualizarStatus(detalhe.id, 'RESOLVIDA')}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Resolver
                  </Button>
                )}
                {detalhe.status === 'RESOLVIDA' && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />Resolvida
                  </span>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={excluirConfirm !== null} onOpenChange={(o) => { if (!o) setExcluirConfirm(null) }}
        title="Excluir solicitação"
        description={`Deseja excluir a solicitação de "${excluirConfirm?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir" variant="destructive"
        onConfirm={handleExcluir} isPending={excluindo}
      />
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ComunicacaoClient() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [filtro, setFiltro] = React.useState<'TODOS' | 'PUBLICADO' | 'RASCUNHO'>('TODOS')
  const [tabPrincipal, setTabPrincipal] = React.useState('avisos')

  const { data: todos = [], isLoading } = useAvisos(false)
  const { data: solicitacoesTodas = [] } = useSolicitacoesContato()

  const pendentesContato = solicitacoesTodas.filter((s) => s.status === 'PENDENTE').length

  const avisos = todos
    .filter((a) => {
      if (filtro === 'PUBLICADO') return a.publicado
      if (filtro === 'RASCUNHO') return !a.publicado
      return true
    })
    .sort((a, b) => {
      if (a.fixado !== b.fixado) return a.fixado ? -1 : 1
      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    })

  const totalPublicados = todos.filter((a) => a.publicado).length

  return (
    <div className="space-y-6">
      <Tabs value={tabPrincipal} onValueChange={setTabPrincipal}>
        <TabsList className="mb-6">
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
          <TabsTrigger value="solicitacoes" className="relative">
            Solicitações de Contato
            {pendentesContato > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">
                {pendentesContato}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avisos" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de avisos</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{todos.length}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Publicados</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{totalPublicados}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{todos.length - totalPublicados}</p></CardContent>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
              <TabsList>
                <TabsTrigger value="TODOS">Todos</TabsTrigger>
                <TabsTrigger value="PUBLICADO">Publicados</TabsTrigger>
                <TabsTrigger value="RASCUNHO">Rascunhos</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />Novo Aviso
            </Button>
          </div>

          {/* Lista */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border p-5 h-36 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : avisos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">Nenhum aviso encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filtro !== 'TODOS'
                  ? `Não há avisos com status ${filtro === 'PUBLICADO' ? 'publicado' : 'rascunho'}.`
                  : 'Crie o primeiro aviso para os associados.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {avisos.map((a) => <AvisoCard key={a.id} aviso={a} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solicitacoes">
          <SolicitacoesContatoPanel />
        </TabsContent>
      </Tabs>

      <NovoAvisoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
