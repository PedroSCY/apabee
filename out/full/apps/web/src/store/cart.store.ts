import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Item do carrinho de compras da loja pública. */
export interface CartItem {
  produtoId: string
  nome: string
  preco: number
  quantidade: number
  imagemUrl?: string
}

interface CartState {
  items: CartItem[]
  drawerOpen: boolean
  addItem: (item: Omit<CartItem, 'quantidade'> & { quantidade?: number }) => void
  removeItem: (produtoId: string) => void
  updateQuantity: (produtoId: string, quantidade: number) => void
  clearCart: () => void
  setDrawerOpen: (v: boolean) => void
  totalItems: () => number
  totalPreco: () => number
}

/** Store persistida do carrinho de compras. */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,

      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.produtoId === item.produtoId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.produtoId === item.produtoId
                  ? { ...i, quantidade: i.quantidade + (item.quantidade ?? 1) }
                  : i,
              ),
            }
          }
          return { items: [...s.items, { ...item, quantidade: item.quantidade ?? 1 }] }
        }),

      removeItem: (produtoId) =>
        set((s) => ({ items: s.items.filter((i) => i.produtoId !== produtoId) })),

      updateQuantity: (produtoId, quantidade) =>
        set((s) => ({
          items:
            quantidade <= 0
              ? s.items.filter((i) => i.produtoId !== produtoId)
              : s.items.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i)),
        })),

      clearCart: () => set({ items: [] }),

      setDrawerOpen: (v) => set({ drawerOpen: v }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantidade, 0),

      totalPreco: () => get().items.reduce((sum, i) => sum + i.preco * i.quantidade, 0),
    }),
    { name: 'apabee-cart' },
  ),
)
