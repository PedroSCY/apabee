'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from 'radix-ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCriarInsumo, useAtualizarInsumo } from '@/hooks/useInsumos'
import type { InsumoResponse } from '@/lib/api/patrimonio'

const CATEGORIAS = [
  { value: 'FERRAMENTA', label: 'Ferramenta' },
  { value: 'INSUMO', label: 'Insumo' },
]

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(120),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  descricao: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  insumo?: InsumoResponse
}

export function InsumoFormDialog({ open, onOpenChange, insumo }: Props) {
  const isEdit = Boolean(insumo)
  const { mutateAsync: criar, isPending: criando } = useCriarInsumo()
  const { mutateAsync: atualizar, isPending: atualizando } = useAtualizarInsumo()
  const isPending = criando || atualizando

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        nome: insumo?.nome ?? '',
        categoria: insumo?.categoria ?? 'FERRAMENTA',
        descricao: insumo?.descricao ?? '',
      })
    }
  }, [open, insumo, reset])

  async function onSubmit(data: FormData) {
    try {
      if (isEdit && insumo) {
        await atualizar({ id: insumo.id, input: { nome: data.nome, descricao: data.descricao } })
        toast.success('Insumo atualizado.')
      } else {
        await criar(data)
        toast.success('Insumo criado.')
      }
      onOpenChange(false)
    } catch {
      toast.error('Erro ao salvar insumo.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md rounded-xl bg-card p-6 shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}>
          <Dialog.Title className="text-base font-semibold mb-4">
            {isEdit ? 'Editar Insumo' : 'Novo Insumo'}
          </Dialog.Title>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" {...register('nome')} placeholder="Ex: Fumigador metálico" />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria *</Label>
              <select
                id="categoria"
                {...register('categoria')}
                disabled={isEdit}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" {...register('descricao')} placeholder="Descrição opcional" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm" type="button" disabled={isPending}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
