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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useCriarSafra } from '@/hooks/useSafras'
import { useFloradas } from '@/hooks/useFloradas'
import type { ApiError } from '@/lib/api/client'

const schema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    floradaId: z.string().min(1, 'Selecione a florada'),
    dataInicio: z.string().min(1, 'Informe a data de início'),
    dataFim: z.string().optional(),
  })
  .refine(
    (d) => !d.dataFim || d.dataFim > d.dataInicio,
    { message: 'Data de fim deve ser após o início', path: ['dataFim'] },
  )

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CriarSafraDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: criar, isPending } = useCriarSafra()
  const { data: floradas = [] } = useFloradas()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      dataInicio: new Date().toISOString().slice(0, 10),
    },
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await criar({ ...data, dataFim: data.dataFim || undefined })
      toast.success('Safra criada com sucesso.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao criar safra.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Safra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Ex: Laranjeira 2025"
              {...register('nome')}
              disabled={isPending}
            />
            {errors.nome && <p className="text-[0.8rem] font-medium text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Florada *</Label>
            <Controller
              control={control}
              name="floradaId"
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione a florada" />
                    </SelectTrigger>
                    <SelectContent emptyMessage="Nenhuma florada cadastrada">
                      {floradas.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Início *</Label>
              <Input id="dataInicio" type="date" {...register('dataInicio')} disabled={isPending} />
              {errors.dataInicio && <p className="text-[0.8rem] font-medium text-destructive">{errors.dataInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataFim">Fim <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input id="dataFim" type="date" {...register('dataFim')} disabled={isPending} />
              {errors.dataFim && <p className="text-[0.8rem] font-medium text-destructive">{errors.dataFim.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando…' : 'Criar Safra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
