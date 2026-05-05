'use client'

import * as React from 'react'
import { Plus, Eye, EyeOff, Megaphone, Bell, Pin, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge, ConfirmDialog } from '@/components/shared'
import {
  useAvisos,
  useCriarAviso,
  useDespublicarAviso,
  useExcluirAviso,
  usePublicarAviso,
} from '@/hooks/useComunicacao'
import type { AvisoResponse } from '@/lib/api/comunicacao'

const CAT_STYLE: Record<string, { label: string; className: string }> = {
  GERAL:      { label: 'Geral',      className: 'bg-muted text-muted-foreground' },
  URGENTE:    { label: 'Urgente',    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  REUNIAO:    { label: 'Reunião',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  FINANCEIRO: { label: 'Financeiro', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

// ─── Dialog de criação ───────────────────────────────────────────────────────

function NovoAvisoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = React.useState({ titulo: '', conteudo: '', categoria: 'GERAL', fixado: false })
  const { mutateAsync: criar, isPending } = useCriarAviso()

  async function handleSubmit(e: React.FormEvent) {
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
    <Dialog.Root open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-lg rounded-xl bg-card p-6 shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}>
          <Dialog.Title className="text-base font-semibold mb-5">Novo Aviso</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                required
                minLength={3}
                placeholder="Título do aviso"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                value={form.categoria}
                onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="GERAL">Geral</option>
                <option value="URGENTE">Urgente</option>
                <option value="REUNIAO">Reunião</option>
                <option value="FINANCEIRO">Financeiro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="conteudo">Conteúdo *</Label>
              <textarea
                id="conteudo"
                rows={5}
                value={form.conteudo}
                onChange={(e) => setForm((p) => ({ ...p, conteudo: e.target.value }))}
                required
                minLength={10}
                placeholder="Texto do aviso para os associados..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.fixado}
                onChange={(e) => setForm((p) => ({ ...p, fixado: e.target.checked }))}
                className="rounded border-input"
              />
              <span className="text-sm">Fixar aviso no topo</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={isPending}>Cancelar</Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Criando...' : 'Criar Aviso'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Card de aviso ───────────────────────────────────────────────────────────

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
    } catch {
      toast.error('Erro ao atualizar aviso.')
    }
  }

  async function handleExcluir() {
    try {
      await excluir(aviso.id)
      toast.success('Aviso excluído.')
    } catch {
      toast.error('Erro ao excluir aviso.')
    }
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
            <Button
              variant="ghost" size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={handleToggle}
              disabled={isPending}
            >
              {aviso.publicado
                ? <><EyeOff className="h-3.5 w-3.5 mr-1" />Despublicar</>
                : <><Eye className="h-3.5 w-3.5 mr-1" />Publicar</>}
            </Button>
            <Button
              variant="ghost" size="sm"
              className="h-7 px-2 text-destructive hover:text-destructive"
              onClick={() => setConfirmExcluir(true)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold leading-snug">{aviso.titulo}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {aviso.conteudo}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">{dataFormatada}</p>
      </div>

      <ConfirmDialog
        open={confirmExcluir}
        onOpenChange={setConfirmExcluir}
        title="Excluir aviso"
        description={`Deseja excluir o aviso "${aviso.titulo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleExcluir}
        isPending={excluindo}
      />
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ComunicacaoClient() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [filtro, setFiltro] = React.useState<'TODOS' | 'PUBLICADO' | 'RASCUNHO'>('TODOS')

  const { data: todos = [], isLoading } = useAvisos(false)

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
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de avisos</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Publicados</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPublicados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todos.length - totalPublicados}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['TODOS', 'PUBLICADO', 'RASCUNHO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filtro === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {f === 'TODOS' ? 'Todos' : f === 'PUBLICADO' ? 'Publicados' : 'Rascunhos'}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Aviso
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-5 h-36 animate-pulse bg-muted/30" />
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

      <NovoAvisoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
