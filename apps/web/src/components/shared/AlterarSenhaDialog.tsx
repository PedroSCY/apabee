'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Diálogo para alteração de senha com validação e integração Supabase Auth. */
export function AlterarSenhaDialog({ open, onOpenChange }: Props) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [isPending, setIsPending] = useState(false)

  function handleOpenChange(v: boolean) {
    if (isPending) return
    if (!v) { setNovaSenha(''); setConfirmarSenha(''); setErro('') }
    onOpenChange(v)
  }

  async function handleSubmit() {
    if (novaSenha.length < 8) { setErro('A senha deve ter no mínimo 8 caracteres.'); return }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }

    setIsPending(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw error
      toast.success('Senha alterada com sucesso.')
      handleOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar senha.'
      toast.error(msg)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="as-nova">Nova senha</Label>
            <Input
              id="as-nova"
              type="password"
              placeholder="Mín. 8 caracteres"
              value={novaSenha}
              onChange={(e) => { setNovaSenha(e.target.value); setErro('') }}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="as-confirmar">Confirmar nova senha</Label>
            <Input
              id="as-confirmar"
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => { setConfirmarSenha(e.target.value); setErro('') }}
              disabled={isPending}
            />
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => void handleSubmit()} disabled={isPending}>
            {isPending ? 'Salvando…' : 'Alterar senha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
