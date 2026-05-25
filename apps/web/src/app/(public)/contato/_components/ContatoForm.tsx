'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCriarSolicitacaoContato } from '@/hooks/useComunicacao'
import { PhoneInput } from '@/components/shared'

type Tipo = 'CONTATO' | 'COLETA' | 'INTEGRACAO'

const TIPOS: { value: Tipo; label: string; descricao: string }[] = [
  { value: 'CONTATO', label: 'Mensagem', descricao: 'Dúvidas gerais ou informações' },
  { value: 'COLETA', label: 'Solicitação de Coleta', descricao: 'Auxílio da APA para coleta ou análise' },
  { value: 'INTEGRACAO', label: 'Quero me Associar', descricao: 'Solicitação de ingresso na associação' },
]

const baseSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email(),
  telefone: z.string().optional(),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres.'),
  localizacao: z.string().optional(),
  municipio: z.string().optional(),
})

type FormData = z.infer<typeof baseSchema>

export function ContatoForm() {
  const [tipo, setTipo] = React.useState<Tipo>('CONTATO')
  const { mutateAsync: criar } = useCriarSolicitacaoContato()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(baseSchema) })

  async function onSubmit(data: FormData) {
    try {
      await criar({
        tipo,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || undefined,
        mensagem: data.mensagem,
        localizacao: data.localizacao || undefined,
        municipio: data.municipio || undefined,
      })
      toast.success('Solicitação enviada! Retornaremos em breve.')
      reset()
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-card space-y-6">
      {/* Seletor de tipo */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Tipo de solicitação</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                tipo === t.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <p className="text-xs font-semibold leading-tight">{t.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{t.descricao}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-nome">Nome *</Label>
            <Input id="c-nome" placeholder="Seu nome completo" {...register('nome')} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-email">E-mail *</Label>
            <Input id="c-email" type="email" placeholder="seu@email.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>

        <Controller
          control={control}
          name="telefone"
          render={({ field }) => (
            <PhoneInput
              id="c-tel"
              label="Telefone"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />

        {tipo === 'COLETA' && (
          <div className="space-y-1.5">
            <Label htmlFor="c-loc">Localização *</Label>
            <Input
              id="c-loc"
              placeholder="Ex: Sítio Boa Vista, zona rural de Prata"
              {...register('localizacao')}
            />
          </div>
        )}

        {tipo === 'INTEGRACAO' && (
          <div className="space-y-1.5">
            <Label htmlFor="c-mun">Município *</Label>
            <Input
              id="c-mun"
              placeholder="Ex: Prata — PB"
              {...register('municipio')}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="c-msg">
            {tipo === 'COLETA'
              ? 'Descreva a coleta *'
              : tipo === 'INTEGRACAO'
              ? 'Experiência com apicultura *'
              : 'Mensagem *'}
          </Label>
          <Textarea
            id="c-msg"
            rows={5}
            placeholder={
              tipo === 'COLETA'
                ? 'Descreva o tipo de coleta, quantidade estimada, urgência…'
                : tipo === 'INTEGRACAO'
                ? 'Conte um pouco sobre sua experiência com abelhas e por que deseja se associar…'
                : 'Como podemos ajudar?'
            }
            {...register('mensagem')}
            className="resize-none"
          />
          {errors.mensagem && (
            <p className="text-xs text-destructive">{errors.mensagem.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" variant="hero" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
        </Button>
      </form>
    </div>
  )
}
