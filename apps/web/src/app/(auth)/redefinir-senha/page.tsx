'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const schema = z
  .object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não conferem',
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

export default function RedefinirSenhaPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      toast.error('Erro ao redefinir senha', { description: error.message })
      return
    }

    await supabase.auth.signOut()
    toast.success('Senha redefinida com sucesso!')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-primary-darker">Apabee</h1>
          <p className="text-sm text-muted-foreground">Associação Pratense de Apicultura</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Nova senha</CardTitle>
            <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirm')}
                />
                {errors.confirm && (
                  <p className="text-sm text-destructive">{errors.confirm.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
