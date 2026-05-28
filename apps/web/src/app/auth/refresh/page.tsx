'use client'

/**
 * Página intermediária de refresh de sessão — executada no browser.
 *
 * Problema: após o fluxo Google OAuth, o token emitido pelo Supabase ainda não contém
 * `app_metadata.role = 'CLIENTE'` (o sync ocorreu no servidor, mas o cookie com o
 * novo token não é propagado de forma confiável via NextResponse.redirect).
 *
 * Solução: redirecionar para esta página antes de qualquer rota protegida. Ela chama
 * `supabase.auth.refreshSession()` no browser — onde o token é armazenado — e só
 * então navega para o destino final. O novo JWT já carrega o role correto.
 */

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Hexagon } from 'lucide-react'

function RefreshContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Valida que o destino é um caminho relativo (prevenção de open redirect)
  const rawNext = searchParams.get('next') ?? '/minha-conta'
  const next = rawNext.startsWith('/') ? rawNext : '/minha-conta'

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    supabase.auth.refreshSession().then(({ error }) => {
      if (error) {
        console.error('[auth/refresh] Falha ao renovar sessão:', error.message)
      }
      // Redireciona independentemente do resultado: em caso de falha, o destino
      // exibirá seu próprio estado de erro (ex.: página de login).
      router.replace(next)
    })
  }, [next, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-honey-gradient shadow-soft">
          <Hexagon className="h-6 w-6 animate-pulse text-primary-foreground" strokeWidth={2.5} />
        </div>
        <p className="text-sm">Finalizando login…</p>
      </div>
    </div>
  )
}

/** useSearchParams requer Suspense boundary para evitar aviso do Next.js em build. */
export default function AuthRefreshPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Hexagon className="h-8 w-8 animate-pulse text-primary" strokeWidth={2.5} />
        </div>
      }
    >
      <RefreshContent />
    </Suspense>
  )
}
