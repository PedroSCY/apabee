import { redirect } from 'next/navigation'

/** Rota removida — conteúdo migrado para a tab "Pedidos" em /minha-conta */
export default function PedidosRedirect() {
  redirect('/minha-conta')
}
