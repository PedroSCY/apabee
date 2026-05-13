'use client'

import { useEffect } from 'react'
import { useTemaStore, type ConfiguracaoTema } from '@/store/tema.store'

const CSS_VAR_MAP: Record<keyof ConfiguracaoTema, string> = {
  corFundo: '--background',
  corTexto: '--foreground',
  corPrimaria: '--primary-base',
  corPrimariaForeground: '--primary-foreground',
  corSidebar: '--sidebar',
  corAccent: '--accent-base',
}

/** Injeta variáveis CSS do tema no `<html>` com base na store de configuração. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const configuracao = useTemaStore((s) => s.configuracao)

  useEffect(() => {
    if (!configuracao) return
    const root = document.documentElement
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      const value = configuracao[key as keyof ConfiguracaoTema]
      if (value) root.style.setProperty(cssVar, value)
    }
  }, [configuracao])

  return <>{children}</>
}
