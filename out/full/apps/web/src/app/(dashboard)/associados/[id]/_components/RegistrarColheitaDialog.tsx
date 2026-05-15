'use client'

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

const schema = z.object({
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo.'),
  volume: z.number().positive('Volume deve ser maior que zero.'),
  unidade: z.string().min(1, 'Informe a unidade.'),
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
    defaultValues: { tipoMateriaPrimaId: '', unidade: 'kg', dataColheita: '', observacao: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      await criarColheita({ ...data, associadoId })
      toast.success('Colheita registrada com sucesso.')
      form.reset()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao registrar colheita. Tente novamente.')
    }
  }

  function handleClose() {
    form.reset()
    onOpenChange(false)
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
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
                />
              )} />
              <FormField control={form.control} name="unidade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <FormControl><Input placeholder="kg, L…" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="dataColheita" render={({ field }) => (
              <FormItem>
                <FormLabel>Data da colheita</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="observacao" render={({ field }) => (
              <FormItem>
                <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl><Textarea rows={2} className="resize-none" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancelar</Button>
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
