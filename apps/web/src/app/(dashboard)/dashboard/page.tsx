import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { AdminDashboard } from './_components/AdminDashboard'
import { AssociadoDashboard } from './_components/AssociadoDashboard'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as 'ADMIN' | 'ASSOCIADO') ?? 'ASSOCIADO'
  const isAdmin = role === 'ADMIN'

  return (
    <div className="p-6 space-y-6">
      {isAdmin
        ? <AdminDashboard />
        : <>
            <PageHeader
              title="Meu Painel"
              description="Seu histórico e situação atual na APA"
            />
            <AssociadoDashboard />
          </>
      }
    </div>
  )
}
