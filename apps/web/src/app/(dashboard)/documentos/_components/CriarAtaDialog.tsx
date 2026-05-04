'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCriarAta } from '@/hooks/useGestao'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function CriarAtaDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useCriarAta()

  const [titulo, setTitulo] = React.useState('')
  const [conteudo, setConteudo] = React.useState('')
  const [dataReuniao, setDataReuniao] = React.useState('')
  const [publicada, setPublicada] = React.useState(false)

  React.useEffect(() => {
    if (!open) { setTitulo(''); setConteudo(''); setDataReuniao(''); setPublicada(false) }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !dataReuniao) { toast.error('Preencha título e data.'); return }
    try {
      await mutateAsync({ titulo: titulo.trim(), conteudo, dataReuniao, publicada })
      toast.success('Ata criada com sucesso!')
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message ?? 'Erro ao criar ata.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">Nova Ata</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Reunião Ordinária — Maio/2026"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Data da Reunião</label>
              <input
                type="date"
                value={dataReuniao}
                onChange={(e) => setDataReuniao(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Conteúdo / Pauta</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={5}
                placeholder="Descreva os assuntos tratados, deliberações e encaminhamentos…"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={publicada}
                onChange={(e) => setPublicada(e.target.checked)}
              />
              Publicar imediatamente
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Salvando…' : 'Criar Ata'}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
