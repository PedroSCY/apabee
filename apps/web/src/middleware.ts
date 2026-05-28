import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Barreira de roteamento baseada em role.
 *
 * Matriz de acesso:
 *  - ADMIN / ASSOCIADO → dashboard (bloqueados em /minha-conta e /checkout)
 *  - CLIENTE           → /minha-conta e /checkout (bloqueados no dashboard)
 *  - sem role / anônimo → sem acesso a rotas protegidas
 *
 * O middleware é a primeira linha de defesa. O layout de cada grupo e os
 * guards da API repetem a verificação de role (defesa em profundidade).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role as string | undefined
  const isAdminOrAssociado = role === 'ADMIN' || role === 'ASSOCIADO'
  const isCliente = role === 'CLIENTE'

  const { pathname } = request.nextUrl

  const DASHBOARD_ROUTES = [
    '/dashboard',
    '/associados',
    '/insumos',
    '/producao',
    '/campanhas',
    '/safras',
    '/produtos',
    '/financeiro',
    '/documentos',
    '/configuracoes',
    '/comunicacao',
    '/gerenciar-loja',
  ]

  const CLIENTE_ROUTES = ['/minha-conta', '/checkout']

  const isLoginPage = pathname.startsWith('/login')
  const isDashboard = DASHBOARD_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const isClienteRoute = CLIENTE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))

  // ── Rotas do Dashboard (ADMIN / ASSOCIADO only) ───────────────────────────
  if (isDashboard) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    // CLIENTE tentando acessar o dashboard → redireciona para área do cliente
    if (isCliente) return NextResponse.redirect(new URL('/minha-conta', request.url))
    // Usuário autenticado mas sem role reconhecida (sync pendente / inválido) → loja
    if (!isAdminOrAssociado) return NextResponse.redirect(new URL('/loja', request.url))
  }

  // ── Rotas do Cliente (qualquer usuário autenticado, exceto ADMIN/ASSOCIADO) ─
  if (isClienteRoute) {
    if (!user) {
      const url = new URL('/loja', request.url)
      url.searchParams.set('login', 'required')
      return NextResponse.redirect(url)
    }
    // ADMIN / ASSOCIADO tentando acessar área de cliente → dashboard
    if (isAdminOrAssociado) return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Página de Login ───────────────────────────────────────────────────────
  if (isLoginPage && user) {
    // ADMIN / ASSOCIADO já autenticados não precisam ver o login
    if (isAdminOrAssociado) return NextResponse.redirect(new URL('/dashboard', request.url))
    // CLIENTE logado → pode acessar /login para entrar com credenciais de associado/admin.
    // O Supabase substituirá a sessão ao autenticar com e-mail+senha — sem conflito.
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
