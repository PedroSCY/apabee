/** Dados retornados pela API ViaCEP */
export interface CepData {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

/**
 * Consulta o endereço pelo CEP via ViaCEP (gratuito, sem autenticação).
 * Retorna null se o CEP for inválido, não encontrado ou a requisição falhar.
 */
export async function buscarCep(cep: string): Promise<CepData | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null

    const data = (await res.json()) as Record<string, string>
    if (data['erro']) return null

    return {
      logradouro: data['logradouro'] ?? '',
      bairro: data['bairro'] ?? '',
      cidade: data['localidade'] ?? '',
      estado: data['uf'] ?? '',
    }
  } catch {
    return null
  }
}

/** Formata string bruta como máscara de CEP: "01310100" → "01310-100" */
export function formatCep(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 8)
  return clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean
}
