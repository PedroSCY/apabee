'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCriarUsuario, useCriarAssociado } from '@/hooks/useAssociados'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CadastrarAssociadoDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: criarUsuario, isPending: criandoUsuario } = useCriarUsuario()
  const { mutateAsync: criarAssociado, isPending: criandoAssociado } = useCriarAssociado()
  const isPending = criandoUsuario || criandoAssociado

  const [form, setForm] = React.useState({
    nome: '',
    email: '',
    telefone: '',
    dataIngresso: '',
    observacoes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function resetForm() {
    setForm({ nome: '', email: '', telefone: '', dataIngresso: '', observacoes: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const usuario = await criarUsuario({
        nome: form.nome.trim(),
        email: form.email.trim(),
        role: 'ASSOCIADO',
        telefone: form.telefone.trim() || undefined,
      })
      await criarAssociado({
        usuarioId: usuario.id,
        dataIngresso: form.dataIngresso || undefined,
        observacoes: form.observacoes.trim() || undefined,
      })
      toast.success(`Associado ${form.nome} cadastrado com sucesso.`)
      resetForm()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar associado.'
      toast.error(msg)
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          if (!v) resetForm()
          onOpenChange(v)
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-lg rounded-xl bg-card p-6 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold">Cadastrar Associado</Dialog.Title>
            <Dialog.Close asChild>
              <button
                disabled={isPending}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="João da Silva"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  minLength={2}
                  disabled={isPending}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(34) 99999-0000"
                  value={form.telefone}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataIngresso">Data de ingresso</Label>
                <Input
                  id="dataIngresso"
                  name="dataIngresso"
                  type="date"
                  value={form.dataIngresso}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows={3}
                  placeholder="Informações adicionais sobre o associado..."
                  value={form.observacoes}
                  onChange={handleChange}
                  disabled={isPending}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              O associado receberá um e-mail para definir sua senha de acesso.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={isPending}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
