'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useCriarColheita, useLotes, useTiposMateriaPrima } from '@/hooks/useProducao'
import { useAssociados } from '@/hooks/useAssociados'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  associadoId: z.string().min(1, 'Selecione um associado'),
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo'),
  loteProducaoId: z.string().min(1, 'Selecione um lote'),
  volume: z.number().positive('Volume deve ser positivo'),
  unidade: z.string().min(1),
  dataColheita: z.string().min(1, 'Informe a data'),
  observacao: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function RegistrarColheitaDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useCriarColheita()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { data: lotes = [] } = useLotes()
  const { data: associados = [] } = useAssociados()

  const lotesAbertos = lotes.filter((l) => l.status === 'ABERTO')

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unidade: 'KG', dataColheita: new Date().toISOString().slice(0, 10) },
  })

  const tipoSelecionadoId = watch('tipoMateriaPrimaId')
  const tipoSelecionado = tipos.find((t) => t.id === tipoSelecionadoId)

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({ ...data, unidade: tipoSelecionado?.unidade ?? data.unidade })
      toast.success('Colheita registrada e estoque atualizado!')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar colheita.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Colheita</DialogTitle>
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

          <div className="space-y-1.5">
            <Label>Lote (aberto)</Label>
            <Controller
              control={control}
              name="loteProducaoId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {lotesAbertos.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.periodo} — {l.tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.loteProducaoId && <p className="text-xs text-destructive">{errors.loteProducaoId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de Matéria-Prima</Label>
            <Controller
              control={control}
              name="tipoMateriaPrimaId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome} ({t.unidade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipoMateriaPrimaId && <p className="text-xs text-destructive">{errors.tipoMateriaPrimaId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                type="number"
                step="0.001"
                {...register('volume', { valueAsNumber: true })}
                placeholder="0.000"
                disabled={isPending}
              />
              {errors.volume && <p className="text-xs text-destructive">{errors.volume.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Input readOnly value={tipoSelecionado?.unidade ?? '—'} className="bg-muted text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dataColheita">Data da Colheita</Label>
            <Input id="dataColheita" type="date" {...register('dataColheita')} disabled={isPending} />
            {errors.dataColheita && <p className="text-xs text-destructive">{errors.dataColheita.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea
              id="observacao"
              rows={2}
              {...register('observacao')}
              disabled={isPending}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Registrando…' : 'Registrar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
