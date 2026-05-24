'use client'

import { useEffect } from 'react'
import { useTemaStore, type ConfiguracaoTema } from '@/store/tema.store'

// Each semantic field drives multiple CSS vars so the whole UI responds.
// Card/popover mantêm cores próprias do globals.css — não sobrescrever para preservar a elevação visual.
const CSS_VAR_MAP: Record<keyof ConfiguracaoTema, string[]> = {
  corFundo:              ['--background'],
  corTexto:              ['--foreground'],
  corPrimaria:           ['--primary-base', '--ring', '--sidebar-primary', '--sidebar-ring'],
  corPrimariaForeground: ['--primary-foreground', '--sidebar-primary-foreground'],
  corSidebar:            ['--sidebar'],
  corAccent:             ['--accent-base'],
}

/** Injeta variáveis CSS do tema no `<html>` com base na store de configuração. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const configuracao = useTemaStore((s) => s.configuracao)

  useEffect(() => {
    if (!configuracao) return
    const root = document.documentElement
    for (const [key, cssVars] of Object.entries(CSS_VAR_MAP)) {
      const value = configuracao[key as keyof ConfiguracaoTema]
      if (value) {
        for (const cssVar of cssVars) root.style.setProperty(cssVar, value)
      }
    }
  }, [configuracao])

  return <>{children}</>
}
