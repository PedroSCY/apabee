import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { AdminCampanhas } from './_components/AdminCampanhas'
import { AssociadoCampanhas } from './_components/AssociadoCampanhas'

export default async function CampanhasPage() {
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
        title="Campanhas"
        description={
          isAdmin
            ? 'Gerencie campanhas de produção e aquisição coletiva'
            : 'Acompanhe as campanhas e suas contribuições'
        }
      />
      {isAdmin ? <AdminCampanhas /> : <AssociadoCampanhas />}
    </div>
  )
}
