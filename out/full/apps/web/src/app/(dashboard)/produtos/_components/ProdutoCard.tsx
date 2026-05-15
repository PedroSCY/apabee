'use client'

import * as React from 'react'
import { Package, MoreVertical, Eye, Archive, Plus, Trash2, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StatusBadge, ConfirmDialog } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  usePublicarProduto,
  useArquivarProduto,
  useDeletarProduto,
  useGerarEstoque,
  useComposicoes,
  useAdicionarComposicao,
  useRemoverComposicao,
  useTiposMateriaPrima,
  useCapacidadeCampanha,
} from '@/hooks/useCatalogo'
import type { ProdutoResponse } from '@/lib/api/catalogo'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function EstoqueLabel({ qtd }: { qtd: number }) {
  if (qtd === 0) return <span className="text-xs font-medium text-red-500">Sem estoque</span>
  if (qtd <= 5) return <span className="text-xs font-medium text-amber-600">{qtd} em estoque</span>
  return <span className="text-xs font-medium text-emerald-600">{qtd} em estoque</span>
}

// ─── Dialog de composição (ingredientes) ─────────────────────────────────────

const UNIDADES = ['KG', 'LITRO', 'GRAMA', 'UNIDADE'] as const

function ComposicaoDialog({
  produto,
  open,
  onOpenChange,
}: {
  produto: ProdutoResponse
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data: composicoes = [], isLoading: carregando } = useComposicoes(produto.id)
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: adicionar, isPending: adicionando } = useAdicionarComposicao(produto.id)
  const { mutateAsync: remover, isPending: removendo } = useRemoverComposicao(produto.id)

  const [form, setForm] = React.useState({
    tipoMateriaPrimaId: '',
    quantidadeNecessaria: '',
    unidade: 'KG',
  })

  async function handleAdicionar(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const qtd = Number(form.quantidadeNecessaria)
    if (!form.tipoMateriaPrimaId || !qtd || qtd <= 0) return
    try {
      await adicionar({
        tipoMateriaPrimaId: form.tipoMateriaPrimaId,
        quantidadeNecessaria: qtd,
        unidade: form.unidade,
      })
      toast.success('Ingrediente adicionado.')
      setForm({ tipoMateriaPrimaId: '', quantidadeNecessaria: '', unidade: 'KG' })
    } catch {
      toast.error('Erro ao adicionar ingrediente.')
    }
  }

  async function handleRemover(id: string) {
    try {
      await remover(id)
      toast.success('Ingrediente removido.')
    } catch {
      toast.error('Erro ao remover ingrediente.')
    }
  }

  const tipoNome = (id: string) => tipos.find((t) => t.id === id)?.nome ?? id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Composição do Produto</DialogTitle>
          <DialogDescription>
            {produto.nome} — ingredientes de matéria-prima por unidade produzida
          </DialogDescription>
        </DialogHeader>

        {/* Lista atual */}
        <div className="space-y-2 min-h-12">
          {carregando ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : composicoes.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhum ingrediente definido.</p>
          ) : (
            composicoes.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                <span>
                  <span className="font-medium">{tipoNome(c.tipoMateriaPrimaId)}</span>
                  <span className="text-muted-foreground ml-2">— {c.quantidadeNecessaria} {c.unidade}</span>
                </span>
                <button
                  onClick={() => void handleRemover(c.id)}
                  disabled={removendo}
                  className="ml-3 p-1 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Formulário para adicionar */}
        <form onSubmit={(e) => void handleAdicionar(e)} className="space-y-3 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adicionar ingrediente</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="tipo-mp">Tipo de matéria-prima *</Label>
              <Select
                value={form.tipoMateriaPrimaId}
                onValueChange={(v) => setForm((p) => ({ ...p, tipoMateriaPrimaId: v }))}
                disabled={adicionando}
              >
                <SelectTrigger id="tipo-mp">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome} ({t.unidade})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qtd-mp">Quantidade *</Label>
              <Input
                id="qtd-mp"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Ex: 0.5"
                value={form.quantidadeNecessaria}
                onChange={(e) => setForm((p) => ({ ...p, quantidadeNecessaria: e.target.value }))}
                required
                disabled={adicionando}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unid-mp">Unidade *</Label>
              <Select
                value={form.unidade}
                onValueChange={(v) => setForm((p) => ({ ...p, unidade: v }))}
                disabled={adicionando}
              >
                <SelectTrigger id="unid-mp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Fechar</Button>
            <Button type="submit" size="sm" disabled={adicionando}>
              <FlaskConical className="h-3.5 w-3.5" />
              {adicionando ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Admin dropdown menu ──────────────────────────────────────────────────────

function AdminMenu({ produto }: { produto: ProdutoResponse }) {
  const [confirmArquivar, setConfirmArquivar] = React.useState(false)
  const [confirmDeletar, setConfirmDeletar] = React.useState(false)
  const [gerarOpen, setGerarOpen] = React.useState(false)
  const [composicaoOpen, setComposicaoOpen] = React.useState(false)
  const [qtdGerar, setQtdGerar] = React.useState('')

  const { mutateAsync: publicar, isPending: publicando } = usePublicarProduto()
  const { mutateAsync: arquivar, isPending: arquivando } = useArquivarProduto()
  const { mutateAsync: deletar, isPending: deletando } = useDeletarProduto()
  const { mutateAsync: gerar, isPending: gerando } = useGerarEstoque()
  const { data: capacidade } = useCapacidadeCampanha(produto.id, produto.campanhaId ?? null)

  const capacidadeMaxima = capacidade?.capacidadeMaxima ?? null
  const qtdNum = Number(qtdGerar)
  const acimaDaCapacidade = capacidadeMaxima !== null && qtdNum > capacidadeMaxima

  const isPending = publicando || arquivando || gerando || deletando

  function resetGerar() {
    setQtdGerar('')
  }

  async function handlePublicar() {
    try {
      await publicar(produto.id)
      toast.success('Produto publicado.')
    } catch {
      toast.error('Erro ao publicar produto.')
    }
  }

  async function handleArquivar() {
    try {
      await arquivar(produto.id)
      toast.success('Produto arquivado.')
    } catch {
      toast.error('Erro ao arquivar produto.')
    }
  }

  async function handleDeletar() {
    try {
      await deletar(produto.id)
      toast.success('Produto excluído.')
    } catch {
      toast.error('Erro ao excluir produto.')
    }
  }

  async function handleGerarEstoque() {
    if (!qtdNum || qtdNum <= 0 || acimaDaCapacidade) return
    try {
      await gerar({ id: produto.id, quantidade: qtdNum, campanhaId: produto.campanhaId })
      toast.success(`${qtdNum} unidades adicionadas ao estoque.`)
      setGerarOpen(false)
      resetGerar()
    } catch {
      toast.error('Erro ao gerar estoque.')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={isPending} className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {produto.status === 'RASCUNHO' && (
            <DropdownMenuItem onClick={handlePublicar}>
              <Eye className="h-3.5 w-3.5" /> Publicar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setComposicaoOpen(true)}>
            <FlaskConical className="h-3.5 w-3.5" /> Composição
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setGerarOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Gerar estoque
          </DropdownMenuItem>
          {produto.status !== 'ARQUIVADO' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmArquivar(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Archive className="h-3.5 w-3.5" /> Arquivar
              </DropdownMenuItem>
            </>
          )}
          {(produto.status === 'RASCUNHO' || produto.status === 'ARQUIVADO') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDeletar(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir permanentemente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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

      <ConfirmDialog
        open={confirmDeletar}
        onOpenChange={setConfirmDeletar}
        title="Excluir produto"
        description={`Deseja excluir permanentemente "${produto.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeletar}
        isPending={deletando}
      />

      <Dialog open={gerarOpen} onOpenChange={(v) => { if (!gerando) { setGerarOpen(v); if (!v) resetGerar() } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Estoque</DialogTitle>
            <DialogDescription>{produto.nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {capacidadeMaxima !== null && (
              <p className="text-xs text-muted-foreground">
                Capacidade disponível na campanha: <span className="font-medium">{capacidadeMaxima} unidades</span>
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="qtd-gerar">Quantidade *</Label>
              <Input
                id="qtd-gerar"
                type="number"
                min={1}
                max={capacidadeMaxima ?? undefined}
                value={qtdGerar}
                onChange={(e) => setQtdGerar(e.target.value)}
                placeholder="Ex: 50"
                disabled={gerando}
                className={acimaDaCapacidade ? 'border-destructive' : ''}
              />
              {acimaDaCapacidade && (
                <p className="text-xs text-destructive">Quantidade excede a capacidade da campanha.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled={gerando} onClick={() => setGerarOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleGerarEstoque} disabled={gerando || !qtdGerar || acimaDaCapacidade}>
              {gerando ? 'Gerando...' : 'Gerar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ComposicaoDialog
        produto={produto}
        open={composicaoOpen}
        onOpenChange={setComposicaoOpen}
      />
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
