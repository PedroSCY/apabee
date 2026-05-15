'use client'

import { useEffect } from 'react'
import { useConfiguracao } from '@/hooks/useGestao'
import { useTemaStore } from '@/store/tema.store'
import type { ConfiguracaoTema } from '@/store/tema.store'

/** Carrega configuração de tema da API e alimenta a store de tema. */
export function ThemeBootstrap() {
  const { data: config } = useConfiguracao()
  const setConfiguracao = useTemaStore((s) => s.setConfiguracao)

  useEffect(() => {
    if (!config) return
    const tema: Partial<ConfiguracaoTema> = {}
    if (config.corFundo) tema.corFundo = config.corFundo
    if (config.corTexto) tema.corTexto = config.corTexto
    if (config.corPrimaria) tema.corPrimaria = config.corPrimaria
    if (config.corPrimariaForeground) tema.corPrimariaForeground = config.corPrimariaForeground
    if (config.corSidebar) tema.corSidebar = config.corSidebar
    if (config.corAccent) tema.corAccent = config.corAccent

    if (Object.keys(tema).length > 0) {
      setConfiguracao(tema as ConfiguracaoTema)
    }
  }, [config, setConfiguracao])

  return null
}
