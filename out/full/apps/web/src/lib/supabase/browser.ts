import { createBrowserClient } from '@supabase/ssr'

/** Cria um cliente Supabase para uso no navegador (lado do cliente). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
