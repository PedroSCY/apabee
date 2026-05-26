'use client'

import * as React from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { useCriarDocumento } from '@/hooks/useGestao'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const CATEGORIAS = [
  { value: 'ATA', label: 'Ata de Reunião' },
  { value: 'FINANCEIRO', label: 'Relatório Financeiro' },
  { value: 'PRESTACAO_CONTAS', label: 'Prestação de Contas' },
  { value: 'RELATORIO', label: 'Relatório de Produção' },
  { value: 'OUTRO', label: 'Outro' },
]

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg'
const ACCEPT_MIME = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png', 'image/jpeg']

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadDocumentoDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending: salvando } = useCriarDocumento()

  const [titulo, setTitulo] = React.useState('')
  const [categoria, setCategoria] = React.useState('ATA')
  const [publicado, setPublicado] = React.useState(false)
  const [arquivo, setArquivo] = React.useState<File | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isPending = enviando || salvando

  React.useEffect(() => {
    if (!open) {
      setTitulo('')
      setCategoria('ATA')
      setPublicado(false)
      setArquivo(null)
      setDragging(false)
    }
  }, [open])

  function pickFile(file: File | undefined) {
    if (!file) return
    if (!ACCEPT_MIME.includes(file.type)) {
      toast.error('Formato não suportado. Use PDF, Word, Excel ou imagem.')
      return
    }
    setArquivo(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0])
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!arquivo) { toast.error('Selecione um arquivo.'); return }
    if (!titulo.trim()) { toast.error('Informe o título.'); return }

    try {
      setEnviando(true)
      const supabase = createSupabaseBrowserClient()

      const ext = arquivo.name.split('.').pop()
      const caminho = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('documentos')
        .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(caminho)

      await mutateAsync({
        titulo: titulo.trim(),
        categoria,
        arquivoUrl: urlData.publicUrl,
        tamanhoBytes: arquivo.size,
        publicado,
      })

      toast.success('Documento enviado com sucesso!')
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message ?? 'Erro ao enviar documento.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Ata Reunião Mai/26"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria} disabled={isPending}>
              <SelectTrigger id="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Arquivo</Label>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={isPending}
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            {arquivo ? (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                <FileText className="h-8 w-8 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate leading-tight">{arquivo.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(arquivo.size)}</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => { setArquivo(null); if (inputRef.current) inputRef.current.value = '' }}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Remover arquivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'w-full rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30',
                  isPending && 'pointer-events-none opacity-50',
                )}
              >
                <UploadCloud className={cn('mx-auto h-8 w-8 mb-2', dragging ? 'text-primary' : 'text-muted-foreground')} />
                <p className="text-sm font-medium">
                  {dragging ? 'Solte o arquivo aqui' : 'Clique ou arraste o arquivo'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, Word, Excel ou imagem</p>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="publicado"
              checked={publicado}
              onCheckedChange={setPublicado}
              disabled={isPending}
            />
            <Label htmlFor="publicado" className="cursor-pointer">Publicar imediatamente</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enviando…' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
