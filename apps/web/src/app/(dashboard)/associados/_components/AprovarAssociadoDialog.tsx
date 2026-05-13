'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAprovarAssociadoPendente } from '@/hooks/useAssociados'

interface Props {
  open: boolean
  associadoId: string
  nomeAssociado: string
  onOpenChange: (v: boolean) => void
}

export function AprovarAssociadoDialog({ open, associadoId, nomeAssociado, onOpenChange }: Props) {
  const [senha, setSenha] = React.useState('')
  const [dataIngresso, setDataIngresso] = React.useState('')
  const { mutateAsync: aprovar, isPending } = useAprovarAssociadoPendente()

  function handleOpenChange(v: boolean) {
    if (isPending) return
    if (!v) { setSenha(''); setDataIngresso('') }
    onOpenChange(v)
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await aprovar({
        id: associadoId,
        input: { senha, dataIngresso: dataIngresso || undefined },
      })
      toast.success(`${nomeAssociado} aprovado e ativado com sucesso.`)
      handleOpenChange(false)
    } catch {
      toast.error('Erro ao aprovar associado.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aprovar associado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Defina a senha inicial e a data de ingresso de <strong>{nomeAssociado}</strong>.
            O acesso ao sistema será liberado imediatamente.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="ap-senha">Senha inicial *</Label>
            <Input
              id="ap-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ap-ingresso">Data de ingresso</Label>
            <Input
              id="ap-ingresso"
              type="date"
              value={dataIngresso}
              onChange={(e) => setDataIngresso(e.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">Se não informada, usa a data de hoje.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled={isPending}
              onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Aprovando...' : 'Aprovar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
