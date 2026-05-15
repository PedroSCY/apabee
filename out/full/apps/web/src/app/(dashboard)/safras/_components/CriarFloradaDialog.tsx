'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useCriarFlorada } from '@/hooks/useFloradas'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  descricao: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CriarFloradaDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: criar, isPending } = useCriarFlorada()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', descricao: '' },
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await criar({ nome: data.nome, descricao: data.descricao || undefined })
      toast.success('Florada criada com sucesso.')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao criar florada.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Florada</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Ex: Laranjeira"
              {...register('nome')}
              disabled={isPending}
            />
            {errors.nome && <p className="text-[0.8rem] font-medium text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea
              id="descricao"
              placeholder="Características da florada..."
              {...register('descricao')}
              disabled={isPending}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando…' : 'Criar Florada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
