'use client'

import * as React from 'react'
import { Plus, Eye, EyeOff, Megaphone, Bell, Pin } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared'

interface Aviso {
  id: string
  titulo: string
  conteudo: string
  publicado: boolean
  fixado: boolean
  criadoEm: string
  categoria: 'GERAL' | 'URGENTE' | 'REUNIAO' | 'FINANCEIRO'
}

const MOCK_AVISOS: Aviso[] = [
  {
    id: '1',
    titulo: 'Reunião ordinária — Junho 2025',
    conteudo: 'Informamos que a reunião ordinária da APA acontecerá no dia 15/06/2025, às 19h, na sede da associação. Pauta: apresentação do relatório de colheita e votação do regulamento interno.',
    publicado: true,
    fixado: true,
    criadoEm: '2025-05-28T10:00:00Z',
    categoria: 'REUNIAO',
  },
  {
    id: '2',
    titulo: 'Prazo para entrega dos relatórios de colheita',
    conteudo: 'Lembramos que o prazo para entrega dos relatórios de colheita referentes ao mês de maio é dia 05/06/2025. Favor registrar no sistema até esta data.',
    publicado: true,
    fixado: false,
    criadoEm: '2025-05-25T14:30:00Z',
    categoria: 'URGENTE',
  },
  {
    id: '3',
    titulo: 'Novo lote de insumos disponível',
    conteudo: 'Informamos que chegaram novos insumos ao estoque da associação: caixas Langstroth, telas excluidoras e alimentadores. Acesse o sistema para solicitar empréstimo.',
    publicado: true,
    fixado: false,
    criadoEm: '2025-05-20T09:00:00Z',
    categoria: 'GERAL',
  },
  {
    id: '4',
    titulo: 'Rateio do lote Abr/25 processado',
    conteudo: 'O rateio referente ao lote de Abril/2025 foi processado. Os valores foram calculados conforme as participações registradas. Consulte o módulo Financeiro para detalhes.',
    publicado: false,
    fixado: false,
    criadoEm: '2025-05-15T16:00:00Z',
    categoria: 'FINANCEIRO',
  },
]

const CAT_STYLE: Record<string, { label: string; className: string }> = {
  GERAL:      { label: 'Geral',      className: 'bg-muted text-muted-foreground' },
  URGENTE:    { label: 'Urgente',    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  REUNIAO:    { label: 'Reunião',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  FINANCEIRO: { label: 'Financeiro', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

function NovoAvisoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = React.useState({ titulo: '', conteudo: '', categoria: 'GERAL', fixado: false })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Aviso criado. Integração com API disponível na Fase 4.')
    setForm({ titulo: '', conteudo: '', categoria: 'GERAL', fixado: false })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
              <Input id="titulo" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} required placeholder="Título do aviso" />
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
                <Button type="button" variant="outline" size="sm">Cancelar</Button>
              </Dialog.Close>
              <Button type="submit" size="sm">Publicar Aviso</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AvisoCard({ aviso }: { aviso: Aviso }) {
  const cat = CAT_STYLE[aviso.categoria] ?? CAT_STYLE.GERAL
  const dataFormatada = format(new Date(aviso.criadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
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
            onClick={() => toast.info(aviso.publicado ? 'Aviso despublicado.' : 'Aviso publicado.')}>
            {aviso.publicado
              ? <><EyeOff className="h-3.5 w-3.5 mr-1" />Despublicar</>
              : <><Eye className="h-3.5 w-3.5 mr-1" />Publicar</>}
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
  )
}

export function ComunicacaoClient() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [filtro, setFiltro] = React.useState<'TODOS' | 'PUBLICADO' | 'RASCUNHO'>('TODOS')

  const avisos = MOCK_AVISOS.filter((a) => {
    if (filtro === 'PUBLICADO') return a.publicado
    if (filtro === 'RASCUNHO') return !a.publicado
    return true
  }).sort((a, b) => {
    if (a.fixado !== b.fixado) return a.fixado ? -1 : 1
    return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  })

  const totalPublicados = MOCK_AVISOS.filter((a) => a.publicado).length

  return (
    <div className="space-y-6">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de avisos</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{MOCK_AVISOS.length}</p>
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
            <p className="text-2xl font-bold">{MOCK_AVISOS.length - totalPublicados}</p>
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

      {/* Lista de avisos */}
      {avisos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">Nenhum aviso encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">Crie o primeiro aviso para os associados.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {avisos.map((a) => <AvisoCard key={a.id} aviso={a} />)}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Dados de demonstração — módulo de comunicação será integrado à API na Fase 4.
      </p>

      <NovoAvisoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
