'use client'

import * as React from 'react'
import { toast } from 'sonner'
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

export function UploadDocumentoDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending: salvando } = useCriarDocumento()

  const [titulo, setTitulo] = React.useState('')
  const [categoria, setCategoria] = React.useState('ATA')
  const [publicado, setPublicado] = React.useState(false)
  const [arquivo, setArquivo] = React.useState<File | null>(null)
  const [enviando, setEnviando] = React.useState(false)

  const isPending = enviando || salvando

  React.useEffect(() => {
    if (!open) {
      setTitulo('')
      setCategoria('ATA')
      setPublicado(false)
      setArquivo(null)
    }
  }, [open])

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
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              disabled={isPending}
              className="w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground cursor-pointer"
            />
            {arquivo && (
              <p className="text-xs text-muted-foreground">
                {arquivo.name} — {(arquivo.size / 1024).toFixed(0)} KB
              </p>
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
