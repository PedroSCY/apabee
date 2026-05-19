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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useCriarTipoMateriaPrima } from '@/hooks/useProducao'
import type { ApiError } from '@/lib/api/client'

const UNIDADES = [
  { value: 'KG', label: 'Quilograma (kg)' },
  { value: 'GRAMA', label: 'Grama (g)' },
  { value: 'LITRO', label: 'Litro (L)' },
  { value: 'UNIDADE', label: 'Unidade (un)' },
]

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  unidade: z.string().min(1, 'Selecione a unidade'),
  descricao: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function CriarTipoMateriaPrimaDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: criar, isPending } = useCriarTipoMateriaPrima()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await criar(data)
      toast.success('Tipo de matéria-prima cadastrado.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao cadastrar tipo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Novo Tipo de Matéria-Prima</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Ex: Mel bruto"
              {...register('nome')}
              disabled={isPending}
            />
            {errors.nome && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.nome.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Unidade de medida *</Label>
            <Controller
              control={control}
              name="unidade"
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES.map(u => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
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
          <div className="space-y-1.5">
            <Label htmlFor="descricao">
              Descrição <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Textarea
              id="descricao"
              rows={2}
              placeholder="Observações sobre este tipo de matéria-prima…"
              {...register('descricao')}
              disabled={isPending}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Cadastrando…' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
