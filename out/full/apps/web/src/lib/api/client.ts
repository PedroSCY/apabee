import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

/** Erro HTTP da API com código de status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Obtém o token JWT da sessão ativa do Supabase. */
async function getToken(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** Faz requisição à API interna com autenticação e tratamento de erro. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken()

  const headers: Record<string, string> = {
    ...(init?.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new ApiError(res.status, (body as { message?: string }).message ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
