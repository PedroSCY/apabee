import { create } from 'zustand'

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

export const useTemaStore = create<TemaState>((set) => ({
  configuracao: null,
  setConfiguracao: (configuracao) => set({ configuracao }),
  resetConfiguracao: () => set({ configuracao: null }),
}))
