import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CampanhaDetalhePage } from './_components/CampanhaDetalhePage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampanhaDetalhePageRoute({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as string | undefined) ?? 'ASSOCIADO'

  return <CampanhaDetalhePage campanhaId={id} isAdmin={role === 'ADMIN'} />
}
