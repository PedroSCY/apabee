import { create } from 'zustand'

/** Configuração visual do tema (cores HSL injetadas via CSS variables). */
export interface ConfiguracaoTema {
  corFundo: string
  corTexto: string
  corPrimaria: string
  corPrimariaForeground: string
  corSidebar: string
  corAccent: string
}

interface TemaState {
  configuracao: ConfiguracaoTema | null
  setConfiguracao: (configuracao: ConfiguracaoTema) => void
  resetConfiguracao: () => void
}

/** Store global do tema da aplicação. */
export const useTemaStore = create<TemaState>((set) => ({
  configuracao: null,
  setConfiguracao: (configuracao) => set({ configuracao }),
  resetConfiguracao: () => set({ configuracao: null }),
}))
