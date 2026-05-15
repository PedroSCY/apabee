'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencyInput } from '@/components/shared'
import { usePrecosSafra, useDefinirPreco } from '@/hooks/useSafras'
import { useTiposMateriaPrima } from '@/hooks/useProducao'
import type { SafraResponse } from '@/lib/api/safras'
import type { ApiError } from '@/lib/api/client'

const schema = z.object({
  tipoMateriaPrimaId: z.string().min(1, 'Selecione o tipo'),
  preco: z.number().positive('Preço deve ser positivo'),
})

type FormData = z.infer<typeof schema>

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  safra: SafraResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrecosSafraDialog({ safra, open, onOpenChange }: Props) {
  const { data: precos = [], isLoading } = usePrecosSafra(safra.id)
  const { data: tipos = [] } = useTiposMateriaPrima()
  const { mutateAsync: definir, isPending } = useDefinirPreco(safra.id)

  const { handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoMateriaPrimaId: undefined },
  })

  React.useEffect(() => { if (!open) reset() }, [open, reset])

  async function onSubmit(data: FormData) {
    try {
      await definir(data)
      toast.success('Preço definido.')
      reset()
    } catch (e) {
      toast.error((e as ApiError).message ?? 'Erro ao definir preço.')
    }
  }

  const tipoNome = (id: string) => tipos.find(t => t.id === id)?.nome ?? id.slice(0, 8)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Preços — {safra.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : precos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum preço definido ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Matéria-Prima</TableHead>
                  <TableHead className="text-right">Preço / Unidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {precos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{tipoNome(p.tipoMateriaPrimaId)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{fmt(p.preco)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
            <p className="text-sm font-medium">Definir / Atualizar Preço</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Controller
                  control={control}
                  name="tipoMateriaPrimaId"
                  render={({ field, fieldState }) => (
                    <>
                      <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={isPending}>
                        <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Selecione…" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipos.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.nome} ({t.unidade})</SelectItem>
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
              <Controller
                control={control}
                name="preco"
                render={({ field, fieldState }) => (
                  <CurrencyInput
                    label="Preço *"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    disabled={isPending}
                  />
                )}
              />
            </div>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Salvando…' : 'Salvar Preço'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
