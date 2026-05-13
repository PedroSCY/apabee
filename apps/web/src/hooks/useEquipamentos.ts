'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  patrimonioApi,
  type AtualizarEquipamentoInput,
  type CriarEquipamentoInput,
} from '@/lib/api/patrimonio'

export const EQUIPAMENTOS_KEY = ['equipamentos'] as const

/** Busca lista de todos os equipamentos. */
export function useEquipamentos() {
  return useQuery({
    queryKey: EQUIPAMENTOS_KEY,
    queryFn: patrimonioApi.listarEquipamentos,
  })
}

/** Busca um equipamento pelo ID. */
export function useBuscarEquipamento(id: string) {
  return useQuery({
    queryKey: [...EQUIPAMENTOS_KEY, id],
    queryFn: () => patrimonioApi.buscarEquipamento(id),
    enabled: Boolean(id),
  })
}

/** Cadastra um novo equipamento. */
export function useCriarEquipamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarEquipamentoInput) => patrimonioApi.criarEquipamento(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
    },
  })
}

/** Atualiza dados de um equipamento. */
export function useAtualizarEquipamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AtualizarEquipamentoInput }) =>
      patrimonioApi.atualizarEquipamento(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
    },
  })
}

/** Marca equipamento como em manutenção. */
export function useColocarEquipamentoEmManutencao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.colocarEquipamentoEmManutencao(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
    },
  })
}

/** Libera equipamento da manutenção. */
export function useLiberarEquipamentoManutencao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.liberarEquipamentoManutencao(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
    },
  })
}

/** Exclui um equipamento pelo ID. */
export function useExcluirEquipamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patrimonioApi.excluirEquipamento(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EQUIPAMENTOS_KEY })
    },
  })
}
