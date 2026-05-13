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
import { useLotes, useTiposMateriaPrima, useCriarColheita } from '@/hooks/useProducao'

const schema = z.object({
  loteProducaoId: z.string().min(1, 'Selecione um lote.'),
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo.'),
  volume: z.coerce.number().positive('Volume deve ser maior que zero.'),
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
  const { data: lotes = [] } = useLotes()
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: criarColheita, isPending } = useCriarColheita()

  const lotesAbertos = lotes.filter((l) => l.status === 'ABERTO')

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { loteProducaoId: '', tipoMateriaPrimaId: '', volume: 0, unidade: 'kg', dataColheita: '', observacao: '' },
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
            <FormField control={form.control} name="loteProducaoId" render={({ field }) => (
              <FormItem>
                <FormLabel>Lote</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione um lote aberto" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {lotesAbertos.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.periodo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

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
              <FormField control={form.control} name="volume" render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
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
                <FormLabel>Observação</FormLabel>
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
