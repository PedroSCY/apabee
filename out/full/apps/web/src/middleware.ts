import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/** Redireciona rotas não autenticadas para /login e autenticadas para /dashboard. */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
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

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const PROTECTED = [
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
  ]

  const isAuth = pathname.startsWith('/login')
  const isDashboard = PROTECTED.some((r) => pathname === r || pathname.startsWith(r + '/'))

  if (isDashboard && !user) return NextResponse.redirect(new URL('/login', request.url))
  if (isAuth && user) return NextResponse.redirect(new URL('/dashboard', request.url))

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|shop|api/auth).*)',
  ],
}
