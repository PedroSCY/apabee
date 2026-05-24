'use client'

import * as React from 'react'
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
import { PhoneInput, CpfInput } from '@/components/shared'
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
    cpf: '',
    telefone: '',
    dataIngresso: '',
    observacoes: '',
    senha: '',
    confirmarSenha: '',
  })
  const [senhaError, setSenhaError] = React.useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name === 'senha' || e.target.name === 'confirmarSenha') setSenhaError('')
  }

  function resetForm() {
    setForm({ nome: '', email: '', cpf: '', telefone: '', dataIngresso: '', observacoes: '', senha: '', confirmarSenha: '' })
    setSenhaError('')
  }

  function handleOpenChange(v: boolean) {
    if (isPending) return
    if (!v) resetForm()
    onOpenChange(v)
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (form.senha && form.senha.length < 8) {
      setSenhaError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (form.senha !== form.confirmarSenha) {
      setSenhaError('As senhas não coincidem.')
      return
    }
    try {
      const usuario = await criarUsuario({
        nome: form.nome.trim(),
        email: form.email.trim(),
        role: 'ASSOCIADO',
        telefone: form.telefone.trim() || undefined,
        senha: form.senha || undefined,
      })
      await criarAssociado({
        usuarioId: usuario.id,
        cpf: form.cpf.replace(/\D/g, '') || undefined,
        dataIngresso: form.dataIngresso ? form.dataIngresso + 'T12:00:00' : undefined,
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar Associado</DialogTitle>
        </DialogHeader>

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

            <CpfInput
              id="cpf"
              name="cpf"
              label="CPF"
              value={form.cpf}
              onChange={(v) => setForm((p) => ({ ...p, cpf: v }))}
              disabled={isPending}
            />

            <PhoneInput
              id="telefone"
              name="telefone"
              label="Telefone"
              value={form.telefone}
              onChange={(v) => setForm((p) => ({ ...p, telefone: v }))}
              disabled={isPending}
            />

            <div className="space-y-1.5">
              <Label htmlFor="dataIngresso">Data de ingresso</Label>
              <div className="flex gap-2">
                <Input
                  id="dataIngresso"
                  name="dataIngresso"
                  type="date"
                  value={form.dataIngresso}
                  onChange={handleChange}
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    const d = new Date()
                    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                    setForm((p) => ({ ...p, dataIngresso: v }))
                  }}
                >
                  Hoje
                </Button>
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                placeholder="Informações adicionais sobre o associado..."
                value={form.observacoes}
                onChange={handleChange}
                disabled={isPending}
                className="resize-none"
              />
            </div>
          </div>

          <div className="col-span-2 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Senha inicial (opcional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Mín. 8 caracteres"
                  value={form.senha}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>
            </div>
            {senhaError && (
              <p className="text-xs text-destructive">{senhaError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {form.senha
                ? 'O associado poderá alterar a senha após o primeiro acesso.'
                : 'Se não informada, o associado receberá um e-mail para definir a própria senha.'}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
