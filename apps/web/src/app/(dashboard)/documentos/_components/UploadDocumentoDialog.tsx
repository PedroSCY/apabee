'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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

  async function handleSubmit(e: React.FormEvent) {
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
          <Dialog.Title className="text-lg font-semibold">Novo Documento</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Ata Reunião Mai/26"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Arquivo</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              {arquivo && (
                <p className="text-xs text-muted-foreground">
                  {arquivo.name} — {(arquivo.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={publicado}
                onChange={(e) => setPublicado(e.target.checked)}
              />
              Publicar imediatamente
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enviando…' : 'Enviar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
