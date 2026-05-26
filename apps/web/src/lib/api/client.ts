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

/** Faz download autenticado de um arquivo e aciona o browser para salvar. */
export async function downloadArquivo(path: string, filename: string): Promise<void> {
  const token = await getToken()
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${API_URL}${path}`, { headers })
  if (!res.ok) throw new ApiError(res.status, `Erro ao baixar arquivo (HTTP ${res.status})`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
    const raw = (body as { message?: string | string[] }).message
    const message = Array.isArray(raw) ? raw[0] : (raw ?? `HTTP ${res.status}`)
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
