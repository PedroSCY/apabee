import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/**
 * Callback OAuth do Supabase.
 *
 * Bug corrigido: em Next.js App Router, cookies setados via `cookieStore.set()` (da API
 * `cookies()`) NÃO são incluídos automaticamente em `NextResponse.redirect()` — eles ficam
 * em objetos de resposta diferentes. A solução é coletar os cookies do `setAll` e aplicá-los
 * diretamente no objeto `NextResponse` que será retornado.
 *
 * Sem essa correção, o browser não recebe a sessão Supabase no redirect, e o
 * `refreshSession()` em /auth/refresh falha por falta de refresh token.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(new URL('/login?erro=link-invalido', url.origin))
  }

  const cookieStore = await cookies()

  // Coleta os cookies que o Supabase quer definir — aplicados diretamente no NextResponse final
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const cookie of cookiesToSet) {
            // cookieStore.set para leitura posterior neste handler
            cookieStore.set(cookie.name, cookie.value, cookie.options)
            // pendingCookies para aplicar no NextResponse que será retornado
            pendingCookies.push(cookie)
          }
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) {
    return NextResponse.redirect(new URL('/login?erro=link-invalido', url.origin))
  }

  const role = data.user?.app_metadata?.role as string | undefined

  // ADMIN e ASSOCIADO vão para o dashboard — não precisam de sync de loja
  if (role === 'ADMIN' || role === 'ASSOCIADO') {
    const res = NextResponse.redirect(new URL(next ?? '/dashboard', url.origin))
    applyPendingCookies(res, pendingCookies)
    return res
  }

  // Usuário Google OAuth sem role ou com role CLIENTE — sincronizar como cliente da loja
  try {
    const syncRes = await fetch(`${API_URL}/loja/auth/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (syncRes.status === 409) {
      const res = NextResponse.redirect(new URL('/loja?erro=conta-associado', url.origin))
      applyPendingCookies(res, pendingCookies)
      return res
    }

    if (!syncRes.ok) {
      console.error('[auth/callback] Sync retornou status inesperado:', syncRes.status)
    }
  } catch (err) {
    // Falha de rede no sync — JwtStrategy fará o lookup via Supabase Admin API como fallback
    console.error('[auth/callback] Erro ao sincronizar cliente:', err)
  }

  // Redireciona para refresh de sessão no browser.
  // O /auth/refresh chama refreshSession() client-side para que o novo JWT
  // (com app_metadata.role = CLIENTE) seja armazenado antes de acessar rotas protegidas.
  const dest = encodeURIComponent(next ?? '/minha-conta')
  const res = NextResponse.redirect(new URL(`/auth/refresh?next=${dest}`, url.origin))
  applyPendingCookies(res, pendingCookies)
  return res
}

/** Aplica cookies coletados do setAll diretamente no NextResponse. */
function applyPendingCookies(
  response: NextResponse,
  cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>,
) {
  for (const { name, value, options } of cookies) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.cookies.set(name, value, options as any)
  }
}
