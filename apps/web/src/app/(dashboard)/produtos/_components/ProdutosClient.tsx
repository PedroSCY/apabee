'use client'

import * as React from 'react'
import { Plus, Search, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CurrencyInput } from '@/components/shared'
import { useProdutos, useCriarProduto } from '@/hooks/useCatalogo'
import { ProdutoCard } from './ProdutoCard'

// ─── Dialog de criação (admin) ────────────────────────────────────────────────

function NovoProdutoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = React.useState<{ nome: string; descricao: string; preco: number | undefined; imagemUrl: string }>({ nome: '', descricao: '', preco: undefined, imagemUrl: '' })
  const { mutateAsync: criar, isPending } = useCriarProduto()

  function handleOpenChange(v: boolean) {
    if (isPending) return
    onOpenChange(v)
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.preco || form.preco <= 0) { toast.error('Preço inválido.'); return }
    try {
      await criar({ nome: form.nome, descricao: form.descricao, preco: form.preco, imagemUrl: form.imagemUrl || undefined })
      toast.success('Produto criado em rascunho.')
      setForm({ nome: '', descricao: '', preco: undefined, imagemUrl: '' })
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar produto.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
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
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Descrição *</Label>
            <Textarea
              id="p-desc"
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              required
              minLength={10}
              placeholder="Descreva o produto para os associados e clientes..."
              disabled={isPending}
              className="resize-none"
            />
          </div>

          <CurrencyInput
            label="Preço (R$) *"
            value={form.preco}
            onChange={(v) => setForm((p) => ({ ...p, preco: v }))}
            disabled={isPending}
          />

          <div className="space-y-1.5">
            <Label htmlFor="p-img">URL da Imagem</Label>
            <Input
              id="p-img"
              type="url"
              value={form.imagemUrl}
              onChange={(e) => setForm((p) => ({ ...p, imagemUrl: e.target.value }))}
              placeholder="https://..."
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <TabsList>
            {STATUS_FILTROS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
