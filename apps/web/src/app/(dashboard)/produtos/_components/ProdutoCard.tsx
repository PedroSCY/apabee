'use client'

import * as React from 'react'
import { Package, MoreVertical, Eye, Archive, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge, ConfirmDialog } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from 'radix-ui'
import { cn } from '@/lib/utils'
import {
  usePublicarProduto,
  useArquivarProduto,
  useGerarEstoque,
} from '@/hooks/useCatalogo'
import type { ProdutoResponse } from '@/lib/api/catalogo'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function EstoqueLabel({ qtd }: { qtd: number }) {
  if (qtd === 0) return <span className="text-xs font-medium text-red-500">Sem estoque</span>
  if (qtd <= 5) return <span className="text-xs font-medium text-amber-600">{qtd} em estoque</span>
  return <span className="text-xs font-medium text-emerald-600">{qtd} em estoque</span>
}

// ─── Admin dropdown menu ──────────────────────────────────────────────────────

function AdminMenu({ produto }: { produto: ProdutoResponse }) {
  const [open, setOpen] = React.useState(false)
  const [confirmArquivar, setConfirmArquivar] = React.useState(false)
  const [gerarOpen, setGerarOpen] = React.useState(false)
  const [qtdGerar, setQtdGerar] = React.useState('')

  const { mutateAsync: publicar, isPending: publicando } = usePublicarProduto()
  const { mutateAsync: arquivar, isPending: arquivando } = useArquivarProduto()
  const { mutateAsync: gerar, isPending: gerando } = useGerarEstoque()

  const isPending = publicando || arquivando || gerando

  async function handlePublicar() {
    try {
      await publicar(produto.id)
      toast.success('Produto publicado.')
    } catch {
      toast.error('Erro ao publicar produto.')
    }
    setOpen(false)
  }

  async function handleArquivar() {
    try {
      await arquivar(produto.id)
      toast.success('Produto arquivado.')
    } catch {
      toast.error('Erro ao arquivar produto.')
    }
  }

  async function handleGerarEstoque() {
    const qtd = Number(qtdGerar)
    if (!qtd || qtd <= 0) return
    try {
      await gerar({ id: produto.id, quantidade: qtd })
      toast.success(`${qtd} unidades adicionadas ao estoque.`)
      setGerarOpen(false)
      setQtdGerar('')
    } catch {
      toast.error('Erro ao gerar estoque.')
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isPending}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:bg-accent transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-7 z-20 w-44 rounded-lg border bg-popover shadow-md py-1">
              {produto.status === 'RASCUNHO' && (
                <button
                  onClick={handlePublicar}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <Eye className="h-3.5 w-3.5" /> Publicar
                </button>
              )}
              <button
                onClick={() => { setGerarOpen(true); setOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                <Plus className="h-3.5 w-3.5" /> Gerar estoque
              </button>
              {produto.status !== 'ARQUIVADO' && (
                <button
                  onClick={() => { setConfirmArquivar(true); setOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                >
                  <Archive className="h-3.5 w-3.5" /> Arquivar
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmArquivar}
        onOpenChange={setConfirmArquivar}
        title="Arquivar produto"
        description={`Deseja arquivar "${produto.nome}"? Ele não aparecerá mais na loja.`}
        confirmLabel="Arquivar"
        variant="destructive"
        onConfirm={handleArquivar}
        isPending={arquivando}
      />

      <Dialog.Root open={gerarOpen} onOpenChange={(v) => { if (!gerando) setGerarOpen(v) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-sm rounded-xl bg-card p-6 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}>
            <Dialog.Title className="text-base font-semibold mb-4">Gerar Estoque</Dialog.Title>
            <p className="text-sm text-muted-foreground mb-4">{produto.nome}</p>
            <div className="space-y-1.5">
              <Label htmlFor="qtd-gerar">Quantidade *</Label>
              <Input
                id="qtd-gerar"
                type="number"
                min={1}
                value={qtdGerar}
                onChange={(e) => setQtdGerar(e.target.value)}
                placeholder="Ex: 50"
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={gerando}>Cancelar</Button>
              </Dialog.Close>
              <Button size="sm" onClick={handleGerarEstoque} disabled={gerando || !qtdGerar}>
                {gerando ? 'Gerando...' : 'Gerar'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  produto: ProdutoResponse
  isAdmin: boolean
}

export function ProdutoCard({ produto, isAdmin }: Props) {
  const esgotado = produto.quantidadeEstoque === 0
  const indisponivel = produto.status !== 'PUBLICADO' || esgotado

  return (
    <div className={cn(
      'flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow',
      produto.status === 'ARQUIVADO' && 'opacity-60',
    )}>
      {/* Thumbnail */}
      <div className="relative flex h-40 items-center justify-center bg-muted/40">
        {produto.imagemUrl ? (
          <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover" />
        ) : (
          <Package className="h-10 w-10 text-muted-foreground/30" />
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug truncate">{produto.nome}</p>
            {produto.descricao && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{produto.descricao}</p>
            )}
          </div>
          {isAdmin && <AdminMenu produto={produto} />}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-base font-bold">{fmt(produto.preco)}</p>
            <EstoqueLabel qtd={produto.quantidadeEstoque} />
          </div>
          <StatusBadge status={produto.status} />
        </div>

        {!isAdmin && produto.status === 'PUBLICADO' && (
          <Button size="sm" className="w-full mt-1" disabled={indisponivel}>
            {esgotado ? 'Indisponível' : 'Adicionar ao Carrinho'}
          </Button>
        )}
      </div>
    </div>
  )
}
