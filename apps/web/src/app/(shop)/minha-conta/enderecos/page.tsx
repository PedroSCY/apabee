import { redirect } from 'next/navigation'

/** Rota removida — conteúdo migrado para a tab "Endereços" em /minha-conta */
export default function EnderecosRedirect() {
  redirect('/minha-conta')
}
