'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Ata</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reunião Ordinária — Maio/2026"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataReuniao">Data da Reunião</Label>
            <Input
              id="dataReuniao"
              type="date"
              value={dataReuniao}
              onChange={(e) => setDataReuniao(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo / Pauta</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={5}
              placeholder="Descreva os assuntos tratados, deliberações e encaminhamentos…"
              disabled={isPending}
              className="resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="publicada"
              checked={publicada}
              onCheckedChange={setPublicada}
              disabled={isPending}
            />
            <Label htmlFor="publicada" className="cursor-pointer">Publicar imediatamente</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando…' : 'Criar Ata'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
