'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const recoverySchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type LoginForm = z.infer<typeof loginSchema>
type RecoveryForm = z.infer<typeof recoverySchema>

function ErrorBanner() {
  const searchParams = useSearchParams()
  const erro = searchParams.get('erro')
  if (erro !== 'link-invalido') return null
  return (
    <p className="text-center text-sm text-destructive">
      Link inválido ou expirado. Solicite um novo.
    </p>
  )
}

function LoginContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'recovery'>('login')
  const [recoverySent, setRecoverySent] = useState(false)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const recoveryForm = useForm<RecoveryForm>({ resolver: zodResolver(recoverySchema) })

  async function onLogin(data: LoginForm) {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setLoading(false)
      toast.error('Não foi possível entrar', {
        description:
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : error.message,
      })
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function onRecovery(data: RecoveryForm) {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()

    const redirectTo = `${window.location.origin}/auth/callback?next=/redefinir-senha`

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo })

    setLoading(false)

    if (error) {
      toast.error('Erro ao enviar e-mail', { description: error.message })
      return
    }

    setRecoverySent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-primary-darker">Apabee</h1>
          <p className="text-sm text-muted-foreground">Associação Pratense de Apicultura</p>
        </div>

        <Suspense>
          <ErrorBanner />
        </Suspense>

        {mode === 'login' ? (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Entrar</CardTitle>
              <CardDescription>Acesse o sistema com seu e-mail e senha</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Esqueci minha senha
                </button>
              </form>
            </CardContent>
          </Card>
        ) : recoverySent ? (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Verifique seu e-mail</CardTitle>
              <CardDescription>
                Enviamos um link de recuperação. Verifique sua caixa de entrada e a pasta de spam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMode('login')
                  setRecoverySent(false)
                }}
              >
                Voltar ao login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Recuperar senha</CardTitle>
              <CardDescription>
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={recoveryForm.handleSubmit(onRecovery)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">E-mail</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...recoveryForm.register('email')}
                  />
                  {recoveryForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {recoveryForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar ao login
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao site
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
