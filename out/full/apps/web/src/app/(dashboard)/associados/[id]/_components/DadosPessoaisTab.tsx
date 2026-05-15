'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, KeyRound, Pencil, Trash2, ShieldOff, ShieldCheck, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge, ConfirmDialog } from '@/components/shared'
import {
  useAtualizarUsuario,
  useAtualizarAssociado,
  useAtualizarSenha,
  useExcluirAssociado,
} from '@/hooks/useAssociados'
import type { AssociadoResponse } from '@/lib/api/identidade'

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  role: z.enum(['ADMIN', 'ASSOCIADO']),
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

type StatusAction = 'suspender' | 'inativar' | 'reativar' | null

const STATUS_ACTION_CONFIG: Record<
  NonNullable<StatusAction>,
  {
    label: string
    targetStatus: string
    title: string
    description: string
    confirmLabel: string
    variant: 'destructive' | 'default'
  }
> = {
  suspender: {
    label: 'Suspender',
    targetStatus: 'SUSPENSO',
    title: 'Suspender associado',
    description:
      'O acesso ao sistema será bloqueado imediatamente. O associado não conseguirá fazer login até ser reativado.',
    confirmLabel: 'Suspender',
    variant: 'destructive',
  },
  inativar: {
    label: 'Inativar',
    targetStatus: 'INATIVO',
    title: 'Inativar associado',
    description:
      'O associado será marcado como inativo e terá o acesso ao sistema revogado. Use esta opção para membros que saíram da associação.',
    confirmLabel: 'Inativar',
    variant: 'destructive',
  },
  reativar: {
    label: 'Reativar',
    targetStatus: 'ATIVO',
    title: 'Reativar associado',
    description: 'O acesso ao sistema será restaurado e o associado poderá fazer login normalmente.',
    confirmLabel: 'Reativar',
    variant: 'default',
  },
}

function StatusActions({
  status,
  onAction,
  isPending,
}: {
  status: string
  onAction: (targetStatus: string) => Promise<void>
  isPending: boolean
}) {
  const [confirm, setConfirm] = useState<StatusAction>(null)

  const actions: StatusAction[] = []
  if (status === 'ATIVO') {
    actions.push('suspender', 'inativar')
  } else if (status === 'SUSPENSO') {
    actions.push('reativar', 'inativar')
  } else if (status === 'INATIVO') {
    actions.push('reativar')
  }

  if (actions.length === 0) return null

  const cfg = confirm ? STATUS_ACTION_CONFIG[confirm] : null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const c = STATUS_ACTION_CONFIG[action!]
          return (
            <Button
              key={action}
              size="sm"
              variant={c.variant === 'destructive' ? 'outline' : 'outline'}
              className={
                c.variant === 'destructive'
                  ? 'border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive'
                  : ''
              }
              disabled={isPending}
              onClick={() => setConfirm(action)}
            >
              {action === 'suspender' && <ShieldOff className="h-3.5 w-3.5 mr-1.5" />}
              {action === 'inativar' && <UserX className="h-3.5 w-3.5 mr-1.5" />}
              {action === 'reativar' && <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />}
              {c.label}
            </Button>
          )
        })}
      </div>

      {cfg && (
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(o) => { if (!o) setConfirm(null) }}
          title={cfg.title}
          description={cfg.description}
          confirmLabel={cfg.confirmLabel}
          variant={cfg.variant}
          isPending={isPending}
          onConfirm={async () => {
            await onAction(cfg.targetStatus)
            setConfirm(null)
          }}
        />
      )}
    </>
  )
}

export function DadosPessoaisTab({ associado }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [senhaDialog, setSenhaDialog] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaError, setSenhaError] = useState('')
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
      const msg = err instanceof Error ? err.message : 'Erro ao excluir conta.'
      toast.error(msg)
      setExcluirDialog(false)
    }
  }

  async function handleRedefinirSenha() {
    if (novaSenha.length < 8) { setSenhaError('A senha deve ter no mínimo 8 caracteres.'); return }
    if (novaSenha !== confirmarSenha) { setSenhaError('As senhas não coincidem.'); return }
    try {
      await atualizarSenha(novaSenha)
      toast.success('Senha redefinida com sucesso.')
      setSenhaDialog(false)
      setNovaSenha('')
      setConfirmarSenha('')
      setSenhaError('')
    } catch {
      toast.error('Erro ao redefinir senha. Tente novamente.')
    }
  }

  function handleSenhaDialogChange(open: boolean) {
    if (!open) { setNovaSenha(''); setConfirmarSenha(''); setSenhaError('') }
    setSenhaDialog(open)
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
      dataIngresso: parseISO(associado.dataIngresso),
      observacoes: associado.observacoes ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      await Promise.all([
        atualizarUsuario({ nome: data.nome, email: data.email, role: data.role }),
        atualizarAssociado({
          dataIngresso: data.dataIngresso.toISOString(),
          observacoes: data.observacoes || undefined,
        }),
      ])
      toast.success('Dados atualizados com sucesso.')
      setEditing(false)
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
    }
  }

  function handleCancel() {
    form.reset()
    setEditing(false)
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
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR}
                          />
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
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
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
              <KeyRound className="h-3.5 w-3.5" />
              Redefinir Senha
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Usuário</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" value={associado.usuario.nome} />
              <Field label="E-mail" value={associado.usuario.email} />
              <Field
                label="Perfil"
                value={associado.usuario.role === 'ADMIN' ? 'Administrador' : 'Associado'}
              />
              <Field
                label="Cadastrado em"
                value={format(parseISO(associado.usuario.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Associado</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" value={<StatusBadge status={associado.status} />} />
              <Field
                label="Data de ingresso"
                value={format(parseISO(associado.dataIngresso), 'dd/MM/yyyy', { locale: ptBR })}
              />
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
                <StatusActions
                  status={associado.status}
                  onAction={handleStatusAction}
                  isPending={salvandoAssociado}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de redefinir senha */}
      <Dialog open={senhaDialog} onOpenChange={handleSenhaDialogChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="novaSenha">Nova senha</Label>
              <Input
                id="novaSenha"
                type="password"
                placeholder="Mín. 8 caracteres"
                value={novaSenha}
                onChange={(e) => { setNovaSenha(e.target.value); setSenhaError('') }}
                disabled={salvandoSenha}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => { setConfirmarSenha(e.target.value); setSenhaError('') }}
                disabled={salvandoSenha}
              />
            </div>
            {senhaError && <p className="text-xs text-destructive">{senhaError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => handleSenhaDialogChange(false)} disabled={salvandoSenha}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void handleRedefinirSenha()} disabled={salvandoSenha}>
              {salvandoSenha ? 'Salvando…' : 'Redefinir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zona de perigo */}
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setExcluirDialog(true)}
            disabled={excluindo}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
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
