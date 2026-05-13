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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCriarLote } from '@/hooks/useProducao'

const schema = z.object({
  tipo: z.enum(['PRODUCAO', 'AQUISICAO']),
  periodo: z.string().min(4, 'Informe o período'),
  dataInicio: z.string().min(1, 'Informe a data de início'),
  dataFim: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function CriarLoteDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useCriarLote()
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'PRODUCAO', periodo: '', dataInicio: '', dataFim: '' },
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ ...data, dataFim: data.dataFim || undefined })
      toast.success('Lote criado com sucesso!')
      onOpenChange(false)
    } catch { toast.error('Erro ao criar lote.') }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Lote de Produção</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCAO">Produção (colheita)</SelectItem>
                    <SelectItem value="AQUISICAO">Aquisição (compra coletiva)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="periodo">Período</Label>
            <Input id="periodo" {...register('periodo')} placeholder="Ex: 2025-01" disabled={isPending} />
            {errors.periodo && <p className="text-xs text-destructive">{errors.periodo.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input id="dataInicio" type="date" {...register('dataInicio')} disabled={isPending} />
              {errors.dataInicio && <p className="text-xs text-destructive">{errors.dataInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataFim">Encerramento <span className="text-muted-foreground">(opcional)</span></Label>
              <Input id="dataFim" type="date" {...register('dataFim')} disabled={isPending} />
              <p className="text-[10px] text-muted-foreground">Deixe vazio para encerrar manualmente.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Criando…' : 'Criar Lote'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
