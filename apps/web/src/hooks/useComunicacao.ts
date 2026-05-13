'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  comunicacaoApi,
  type CriarAvisoInput,
  type CriarSolicitacaoContatoInput,
  type StatusSolicitacaoContato,
} from '@/lib/api/comunicacao'

export const AVISOS_KEY = ['avisos'] as const

export function useAvisos(apenasPublicados = false) {
  return useQuery({
    queryKey: [...AVISOS_KEY, { apenasPublicados }],
    queryFn: () => comunicacaoApi.listarAvisos(apenasPublicados),
  })
}

export function useCriarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarAvisoInput) => comunicacaoApi.criarAviso(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export function usePublicarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.publicarAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export function useDespublicarAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.despublicarAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export function useExcluirAviso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.excluirAviso(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: AVISOS_KEY }),
  })
}

export const SOLICITACOES_CONTATO_KEY = ['solicitacoes-contato'] as const

export function useSolicitacoesContato(status?: StatusSolicitacaoContato) {
  return useQuery({
    queryKey: [...SOLICITACOES_CONTATO_KEY, status],
    queryFn: () => comunicacaoApi.listarSolicitacoesContato(status),
  })
}

export function useCriarSolicitacaoContato() {
  return useMutation({
    mutationFn: (input: CriarSolicitacaoContatoInput) =>
      comunicacaoApi.criarSolicitacaoContato(input),
  })
}

export function useAtualizarStatusSolicitacaoContato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusSolicitacaoContato }) =>
      comunicacaoApi.atualizarStatusSolicitacaoContato(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SOLICITACOES_CONTATO_KEY }),
  })
}

export function useExcluirSolicitacaoContato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacaoApi.excluirSolicitacaoContato(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SOLICITACOES_CONTATO_KEY }),
  })
}
