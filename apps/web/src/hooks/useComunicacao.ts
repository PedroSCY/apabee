'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  comunicacaoApi,
  type CriarAvisoInput,
  type CriarSolicitacaoContatoInput,
  type StatusSolicitacaoContato,
} from '@/lib/api/comunicacao'

export const AVISOS_KEY = ['avisos'] as const

/** Busca lista de avisos publicados. */
export function useAvisos(apenasPublicados = false) {
  return useQuery({
    queryKey: [...AVISOS_KEY, { apenasPublicados }],
    queryFn: () => comunicacaoApi.listarAvisos(apenasPublicados),
  })
}

/** Cria um novo aviso. */
export function useCriarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAvisoInput) => comunicacaoApi.criarAviso(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

/** Publica um aviso para os associados. */
export function usePublicarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.publicarAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

/** Despublica um aviso. */
export function useDespublicarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.despublicarAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

/** Exclui um aviso pelo ID. */
export function useExcluirAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.excluirAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export const SOLICITACOES_CONTATO_KEY = ['solicitacoes-contato'] as const

/** Busca solicitações de contato por status. */
export function useSolicitacoesContato(status?: StatusSolicitacaoContato) {
  return useQuery({
    queryKey: [...SOLICITACOES_CONTATO_KEY, status],
    queryFn: () => comunicacaoApi.listarSolicitacoesContato(status),
  })
}

/** Cria uma nova solicitação de contato. */
export function useCriarSolicitacaoContato() {
  return useMutation({
    mutationFn: (input: CriarSolicitacaoContatoInput) =>
      comunicacaoApi.criarSolicitacaoContato(input),
  })
}

/** Atualiza o status de uma solicitação de contato. */
export function useAtualizarStatusSolicitacaoContato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusSolicitacaoContato }) =>
      comunicacaoApi.atualizarStatusSolicitacaoContato(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SOLICITACOES_CONTATO_KEY }),
  })
}

/** Exclui uma solicitação de contato. */
export function useExcluirSolicitacaoContato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.excluirSolicitacaoContato(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SOLICITACOES_CONTATO_KEY }),
  })
}
