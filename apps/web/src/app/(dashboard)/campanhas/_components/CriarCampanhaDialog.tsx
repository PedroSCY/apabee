'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/shared'
import { useCriarCampanha } from '@/hooks/useCampanhas'
import { useSafras } from '@/hooks/useSafras'
import type { ApiError } from '@/lib/api/client'

const schema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    tipo: z.enum(['PRODUCAO', 'AQUISICAO'], { message: 'Selecione o tipo' }),
    dataInicio: z.string().min(1, 'Informe a data de início'),
    dataFim: z.string().optional(),
    destinatario: z.enum(['INDIVIDUAL', 'APA']).optional(),
    valorMeta: z.number().positive('Valor deve ser positivo').optional(),
    prazoContribuicao: z.string().optional(),
    safraId: z.string().optional(),
    valorMinimo: z.number().positive('Deve ser positivo').optional(),
    valorMaximo: z.number().positive('Deve ser positivo').optional(),
  })
  .refine(
    (d) => d.tipo !== 'AQUISICAO' || (d.valorMeta != null && d.valorMeta > 0),
    { message: 'Valor meta é obrigatório para campanhas de aquisição', path: ['valorMeta'] },
  )
  .refine(
    (d) => !d.valorMinimo || !d.valorMaximo || d.valorMinimo <= d.valorMaximo,
    { message: 'Valor mínimo deve ser ≤ valor máximo', path: ['valorMinimo'] },
  )

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CriarCampanhaDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: criar, isPending } = useCriarCampanha()
  const { data: safras = [] } = useSafras()
  const safrasAtivas = safras.filter(s => s.status === 'EM_ANDAMENTO')

  const { register, handleSubmit, reset, control, watch, clearErrors, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        nome: '',
        tipo: 'PRODUCAO',
        dataInicio: new Date().toISOString().slice(0, 10),
        dataFim: undefined,
        destinatario: undefined,
        valorMeta: undefined,
        prazoContribuicao: undefined,
        safraId: undefined,
        valorMinimo: undefined,
        valorMaximo: undefined,
      },
    })

  const tipo = watch('tipo')

  React.useEffect(() => {
    if (tipo === 'PRODUCAO') clearErrors('valorMeta')
  }, [tipo, clearErrors])

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await criar({
        nome: data.nome,
        tipo: data.tipo,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim || undefined,
        destinatario: data.destinatario,
        valorMeta: data.valorMeta,
        prazoContribuicao: data.prazoContribuicao || undefined,
        safraId: data.safraId || undefined,
        valorMinimo: data.valorMinimo,
        valorMaximo: data.valorMaximo,
      })
      toast.success('Campanha criada com sucesso.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao criar campanha.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
          <DialogDescription>Crie uma campanha de produção ou aquisição coletiva.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Ex: Mel Laranjeira 2025"
              {...register('nome')}
              disabled={isPending}
            />
            {errors.nome && <p className="text-[0.8rem] font-medium text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCAO">Produção — colheitas e processamento</SelectItem>
                      <SelectItem value="AQUISICAO">Aquisição — compra coletiva</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {safrasAtivas.length > 0 && (
            <div className="space-y-1.5">
              <Label>Safra <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Controller
                control={control}
                name="safraId"
                render={({ field }) => (
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma safra vinculada" />
                    </SelectTrigger>
                    <SelectContent>
                      {safrasAtivas.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.nome}{s.floradaNome ? ` — ${s.floradaNome}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Início *</Label>
              <Input id="dataInicio" type="date" {...register('dataInicio')} disabled={isPending} />
              {errors.dataInicio && <p className="text-[0.8rem] font-medium text-destructive">{errors.dataInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataFim">Fim <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input id="dataFim" type="date" {...register('dataFim')} disabled={isPending} />
            </div>
          </div>

          {tipo === 'AQUISICAO' && (
            <>
              <div className="space-y-1.5">
                <Label>Destinatário <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <Controller
                  control={control}
                  name="destinatario"
                  render={({ field }) => (
                    <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o destinatário…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">Individual — cada associado faz seu pedido</SelectItem>
                        <SelectItem value="APA">APA — aquisição para a associação</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="valorMeta"
                  render={({ field, fieldState }) => (
                    <CurrencyInput
                      label="Meta (R$) *"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isPending}
                    />
                  )}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="prazoContribuicao">Prazo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input id="prazoContribuicao" type="date" {...register('prazoContribuicao')} disabled={isPending} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="valorMinimo"
                  render={({ field, fieldState }) => (
                    <CurrencyInput
                      label="Cota mínima (R$)"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isPending}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="valorMaximo"
                  render={({ field, fieldState }) => (
                    <CurrencyInput
                      label="Cota máxima (R$)"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isPending}
                    />
                  )}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando…' : 'Criar Campanha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
