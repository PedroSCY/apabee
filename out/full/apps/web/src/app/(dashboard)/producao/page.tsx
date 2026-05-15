import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { AdminProducao } from './_components/AdminProducao'
import { AssociadoProducao } from './_components/AssociadoProducao'

export default async function ProducaoPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as string | undefined) ?? 'ASSOCIADO'
  const isAdmin = role === 'ADMIN'

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Produção"
        description={
          isAdmin
            ? 'Gerencie colheitas e o catálogo de tipos de matéria-prima'
            : 'Acompanhe suas colheitas e contribuições em campanhas'
        }
      />
      {isAdmin ? <AdminProducao /> : <AssociadoProducao />}
    </div>
  )
}
