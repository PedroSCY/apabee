'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, KeyRound, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, CpfInput } from '@/components/shared'
import {
  useAtualizarUsuario,
  useAtualizarAssociado,
  useAtualizarSenha,
  useExcluirAssociado,
} from '@/hooks/useAssociados'
import type { AssociadoResponse } from '@/lib/api/identidade'
import { StatusActions } from './StatusActions'
import { RedefinirSenhaDialog } from './RedefinirSenhaDialog'

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  role: z.enum(['ADMIN', 'ASSOCIADO']),
  cpf: z.string().optional(),
  dataIngresso: z.date(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  associado: AssociadoResponse
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? '—'}</p>
    </div>
  )
}

export function DadosPessoaisTab({ associado }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [senhaDialog, setSenhaDialog] = useState(false)
  const [excluirDialog, setExcluirDialog] = useState(false)

  const { mutateAsync: atualizarUsuario, isPending: salvandoUsuario } = useAtualizarUsuario(associado.usuario.id)
  const { mutateAsync: atualizarAssociado, isPending: salvandoAssociado } = useAtualizarAssociado(associado.id)
  const { mutateAsync: atualizarSenha, isPending: salvandoSenha } = useAtualizarSenha(associado.usuario.id)
  const { mutateAsync: excluirAssociado, isPending: excluindo } = useExcluirAssociado()
  const isSaving = salvandoUsuario || salvandoAssociado

  async function handleExcluir() {
    try {
      await excluirAssociado(associado.id)
      toast.success('Conta excluída com sucesso.')
      router.push('/associados')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir conta.')
      setExcluirDialog(false)
    }
  }

  async function handleStatusAction(targetStatus: string) {
    try {
      await atualizarAssociado({ status: targetStatus })
      toast.success('Status atualizado com sucesso.')
    } catch {
      toast.error('Erro ao atualizar status.')
      throw new Error('status update failed')
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: associado.usuario.nome,
      email: associado.usuario.email,
      role: associado.usuario.role as 'ADMIN' | 'ASSOCIADO',
      cpf: associado.cpf ?? '',
      dataIngresso: new Date(associado.dataIngresso.slice(0, 10) + 'T12:00:00'),
      observacoes: associado.observacoes ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      await Promise.all([
        atualizarUsuario({ nome: data.nome, email: data.email, role: data.role }),
        atualizarAssociado({
          cpf: data.cpf?.replace(/\D/g, '') || undefined,
          dataIngresso: (() => {
            const d = data.dataIngresso
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T12:00:00`
          })(),
          observacoes: data.observacoes || undefined,
        }),
      ])
      toast.success('Dados atualizados com sucesso.')
      setEditing(false)
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
    }
  }

  if (editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Editar Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Usuário</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ASSOCIADO">Associado</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Associado</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <CpfInput value={field.value ?? ''} onChange={field.onChange} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataIngresso" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de ingresso</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {field.value
                                ? format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                                : 'Selecione uma data'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="observacoes" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea rows={3} className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { form.reset(); setEditing(false) }} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando…' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Dados Cadastrais</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSenhaDialog(true)}>
              <KeyRound className="h-3.5 w-3.5" />Redefinir Senha
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Usuário</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" value={associado.usuario.nome} />
              <Field label="E-mail" value={associado.usuario.email} />
              <Field label="Perfil" value={associado.usuario.role === 'ADMIN' ? 'Administrador' : 'Associado'} />
              <Field label="Cadastrado em" value={format(parseISO(associado.usuario.criadoEm), 'dd/MM/yyyy', { locale: ptBR })} />
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Associado</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" value={<StatusBadge status={associado.status} />} />
              <Field label="CPF" value={associado.cpf ?? '—'} />
              <Field label="Data de ingresso" value={format(new Date(associado.dataIngresso.slice(0, 10) + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })} />
              <Field label="Observações" value={associado.observacoes || '—'} />
            </div>
          </div>

          {associado.status !== 'PENDENTE' && (
            <>
              <Separator />
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Controle de Acesso
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {associado.status === 'ATIVO' && 'Associado com acesso ativo ao sistema.'}
                  {associado.status === 'SUSPENSO' && 'Acesso temporariamente bloqueado. O associado não consegue fazer login.'}
                  {associado.status === 'INATIVO' && 'Associado inativo. Acesso ao sistema revogado.'}
                </p>
                <StatusActions status={associado.status} onAction={handleStatusAction} isPending={salvandoAssociado} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RedefinirSenhaDialog
        open={senhaDialog}
        onOpenChange={setSenhaDialog}
        onConfirm={async (senha) => {
          await atualizarSenha(senha)
          toast.success('Senha redefinida com sucesso.')
        }}
        isPending={salvandoSenha}
      />

      <Card className="border-destructive/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Excluir conta</p>
            <p className="text-xs text-muted-foreground">
              Remove permanentemente o associado, todos os seus dados e o acesso ao sistema.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setExcluirDialog(true)} disabled={excluindo}>
            <Trash2 className="h-3.5 w-3.5" />Excluir
          </Button>
        </CardContent>
      </Card>

      <Dialog open={excluirDialog} onOpenChange={setExcluirDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir conta de {associado.usuario.nome}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação é <strong className="text-foreground">permanente e irreversível</strong>.
            Todos os dados do associado — patrimônio, colheitas, participações e movimentos
            financeiros — serão excluídos.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setExcluirDialog(false)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => void handleExcluir()} disabled={excluindo}>
              {excluindo ? 'Excluindo…' : 'Excluir permanentemente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
