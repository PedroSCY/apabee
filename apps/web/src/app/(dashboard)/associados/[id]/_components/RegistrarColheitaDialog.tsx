'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { DecimalInput } from '@/components/shared'
import { useTiposMateriaPrima, useCriarColheita } from '@/hooks/useProducao'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  tipoMateriaPrimaId: z.uuid('Selecione o tipo.'),
  volume: z.number().positive('Volume deve ser maior que zero.'),
  dataColheita: z.string().min(1, 'Informe a data.'),
  observacao: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  associadoId: string
}

export function RegistrarColheitaDialog({ open, onOpenChange, associadoId }: Props) {
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: criarColheita, isPending } = useCriarColheita()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoMateriaPrimaId: '',
      dataColheita: new Date().toISOString().slice(0, 10),
      observacao: '',
    },
  })

  const tipoSelecionadoId = form.watch('tipoMateriaPrimaId')
  const tipoSelecionado = tipos.find((t) => t.id === tipoSelecionadoId)

  React.useEffect(() => { if (!open) form.reset() }, [open, form])

  async function onSubmit(data: FormData) {
    try {
      await criarColheita({
        ...data,
        associadoId,
        unidade: tipoSelecionado?.unidade ?? 'KG',
      })
      toast.success('Colheita registrada com sucesso.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao registrar colheita.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Colheita</DialogTitle>
          <DialogDescription>Registre uma nova colheita para este associado.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="tipoMateriaPrimaId" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de matéria-prima</FormLabel>
                <Select value={field.value || ''} onValueChange={field.onChange} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome} ({t.unidade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="volume" render={({ field, fieldState }) => (
                <DecimalInput
                  id="volume"
                  label="Volume"
                  decimals={3}
                  min={0.001}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isPending}
                />
              )} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Unidade</label>
                <Input readOnly value={tipoSelecionado?.unidade ?? '—'} className="bg-muted text-muted-foreground" />
              </div>
            </div>

            <FormField control={form.control} name="dataColheita" render={({ field }) => (
              <FormItem>
                <FormLabel>Data da colheita</FormLabel>
                <FormControl><Input type="date" {...field} disabled={isPending} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="observacao" render={({ field }) => (
              <FormItem>
                <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl><Textarea rows={2} className="resize-none" disabled={isPending} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Registrando…' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
