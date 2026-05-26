'use client'

import * as React from 'react'
import { Plus, Search, Package, X, LayoutGrid, LayoutList } from 'lucide-react'
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
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { ProdutoCard } from './ProdutoCard'

// ─── Validação e compressão de imagem ────────────────────────────────────────

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function validateImagem(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return 'Formato não suportado. Use JPG, PNG ou WebP.'
  if (file.size > MAX_SIZE_BYTES) return 'Arquivo muito grande. Máximo 5 MB.'
  return null
}

// Redimensiona para no máximo maxPx no lado maior e converte para JPEG.
function compressImage(file: File, maxPx = 1200, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Falha na compressão')); return }
          resolve(new File([blob], 'imagem.jpg', { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Imagem inválida')) }
    img.src = objectUrl
  })
}

// ─── Dialog de criação (admin) ────────────────────────────────────────────────

function NovoProdutoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = React.useState<{ nome: string; descricao: string; preco: number | undefined }>({ nome: '', descricao: '', preco: undefined })
  const [imagem, setImagem] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { mutateAsync: criar, isPending: criando } = useCriarProduto()

  const isPending = criando || uploading

  // Gera/revoga a URL de preview sempre que a imagem selecionada muda.
  React.useEffect(() => {
    if (!imagem) { setPreview(null); return }
    const url = URL.createObjectURL(imagem)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imagem])

  // Limpa o formulário ao fechar.
  React.useEffect(() => {
    if (!open) {
      setForm({ nome: '', descricao: '', preco: undefined })
      setImagem(null)
    }
  }, [open])

  function handleOpenChange(v: boolean) {
    if (isPending) return
    onOpenChange(v)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    const erro = validateImagem(file)
    if (erro) {
      toast.error(erro)
      e.target.value = ''
      return
    }
    setImagem(file)
  }

  function removerImagem() {
    setImagem(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.preco || form.preco <= 0) { toast.error('Preço inválido.'); return }

    let imagemUrl: string | undefined
    if (imagem) {
      try {
        setUploading(true)
        const supabase = createSupabaseBrowserClient()
        const compressed = await compressImage(imagem)
        const caminho = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const { error: uploadErr } = await supabase.storage
          .from('imagens-produto')
          .upload(caminho, compressed, { contentType: 'image/jpeg', upsert: false })
        if (uploadErr) throw new Error(uploadErr.message)
        const { data: urlData } = supabase.storage.from('imagens-produto').getPublicUrl(caminho)
        imagemUrl = urlData.publicUrl
      } catch {
        toast.error('Erro ao fazer upload da imagem.')
        return
      } finally {
        setUploading(false)
      }
    }

    try {
      await criar({ nome: form.nome, descricao: form.descricao, preco: form.preco, imagemUrl })
      toast.success('Produto criado em rascunho.')
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
            <Label>Imagem do produto</Label>
            {preview ? (
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{imagem?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {((imagem?.size ?? 0) / 1024).toFixed(0)} KB · será comprimida para JPEG
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={removerImagem}
                    disabled={isPending}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={isPending}
                className="w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground cursor-pointer"
              />
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG ou WebP · máx. 5 MB · redimensionada automaticamente para 1200 px</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {uploading ? 'Enviando imagem...' : criando ? 'Criando...' : 'Criar Produto'}
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

const VIEW_KEY = 'produtos-view'

export function ProdutosClient({ isAdmin }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [busca, setBusca] = React.useState('')
  const [filtro, setFiltro] = React.useState<Filtro>('TODOS')
  const [view, setView] = React.useState<'grid' | 'lista'>(() => {
    if (typeof window === 'undefined') return 'grid'
    return (localStorage.getItem(VIEW_KEY) as 'grid' | 'lista') ?? 'grid'
  })

  function toggleView(v: 'grid' | 'lista') {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

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
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-input bg-background">
            <button
              type="button"
              onClick={() => toggleView('grid')}
              className={`flex items-center justify-center h-8 w-8 rounded-l-md transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              title="Visualização em grade"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleView('lista')}
              className={`flex items-center justify-center h-8 w-8 rounded-r-md transition-colors ${view === 'lista' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              title="Visualização em lista"
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Produto
            </Button>
          )}
        </div>
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

      {/* Grid / Lista */}
      {isLoading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border h-64 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border h-16 animate-pulse bg-muted/30" />
            ))}
          </div>
        )
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
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p) => (
            <ProdutoCard key={p.id} produto={p} isAdmin={isAdmin} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {produtos.map((p) => (
            <ProdutoCard key={p.id} produto={p} isAdmin={isAdmin} compact />
          ))}
        </div>
      )}

      {isAdmin && <NovoProdutoDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  )
}
