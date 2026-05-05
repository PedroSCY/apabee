'use client'

import * as React from 'react'
import { Plus, Search, Package } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProdutos, useCriarProduto } from '@/hooks/useCatalogo'
import { ProdutoCard } from './ProdutoCard'

// ─── Dialog de criação (admin) ────────────────────────────────────────────────

function NovoProdutoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = React.useState({ nome: '', descricao: '', preco: '', imagemUrl: '' })
  const { mutateAsync: criar, isPending } = useCriarProduto()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const preco = Number(form.preco)
    if (!preco || preco <= 0) { toast.error('Preço inválido.'); return }
    try {
      await criar({ nome: form.nome, descricao: form.descricao, preco, imagemUrl: form.imagemUrl || undefined })
      toast.success('Produto criado em rascunho.')
      setForm({ nome: '', descricao: '', preco: '', imagemUrl: '' })
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar produto.')
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
          <Dialog.Title className="text-base font-semibold mb-5">Novo Produto</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-nome">Nome *</Label>
              <Input
                id="p-nome"
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                required
                minLength={2}
                placeholder="Ex: Mel Silvestre 500g"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Descrição *</Label>
              <textarea
                id="p-desc"
                rows={3}
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                required
                minLength={10}
                placeholder="Descreva o produto para os associados e clientes..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-preco">Preço (R$) *</Label>
              <Input
                id="p-preco"
                type="number"
                step="0.01"
                min="0.01"
                value={form.preco}
                onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))}
                required
                placeholder="0,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-img">URL da Imagem</Label>
              <Input
                id="p-img"
                type="url"
                value={form.imagemUrl}
                onChange={(e) => setForm((p) => ({ ...p, imagemUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={isPending}>Cancelar</Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Criando...' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Status filter pills ──────────────────────────────────────────────────────

const STATUS_FILTROS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PUBLICADO', label: 'Publicados' },
  { value: 'RASCUNHO', label: 'Rascunhos' },
  { value: 'ARQUIVADO', label: 'Arquivados' },
] as const

type Filtro = typeof STATUS_FILTROS[number]['value']

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isAdmin: boolean
}

export function ProdutosClient({ isAdmin }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>('TODOS')

  const { data: todos = [], isLoading } = useProdutos(false)

  const produtos = todos.filter((p) => {
    if (!isAdmin && p.status !== 'PUBLICADO') return false
    const matchStatus = filtro === 'TODOS' || p.status === filtro
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8"
          />
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Produto
          </Button>
        )}
      </div>

      {/* Filtros de status (apenas admin vê todos) */}
      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTROS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filtro === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border h-64 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">Nenhum produto encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            {busca
              ? 'Tente outro termo de busca.'
              : isAdmin
              ? 'Crie o primeiro produto com o botão acima.'
              : 'Não há produtos disponíveis no momento.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p) => (
            <ProdutoCard key={p.id} produto={p} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {isAdmin && <NovoProdutoDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  )
}
