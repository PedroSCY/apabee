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
import { useRegistrarParticipacao } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  volume: z.number().positive().optional(),
  valorInvestido: z.number().positive().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  loteId: string
  loteTipo: string
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function RegistrarParticipacaoDialog({ loteId, loteTipo, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useRegistrarParticipacao()
  const { data: associados = [] } = useAssociados()
  const isProducao = loteTipo === 'PRODUCAO'

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ loteId, input: data })
      toast.success('Participação registrada! Percentual calculado automaticamente.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar participação.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar Participação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Associado</Label>
            <Controller
              control={control}
              name="associadoId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {associados.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.usuario.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.associadoId && <p className="text-xs text-destructive">{errors.associadoId.message}</p>}
          </div>

          {isProducao ? (
            <div className="space-y-1.5">
              <Label htmlFor="volume">Volume produzido (kg / L)</Label>
              <Input
                id="volume"
                type="number"
                step="0.001"
                placeholder="Ex: 12.5"
                {...register('volume', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.volume && <p className="text-xs text-destructive">{errors.volume.message}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="valorInvestido">Valor investido (R$)</Label>
              <Input
                id="valorInvestido"
                type="number"
                step="0.01"
                placeholder="Ex: 1000.00"
                {...register('valorInvestido', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.valorInvestido && <p className="text-xs text-destructive">{errors.valorInvestido.message}</p>}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            O percentual de participação será calculado automaticamente pelo sistema.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Registrando…' : 'Registrar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
