import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { AdminInsumos } from './_components/AdminInsumos'
import { AssociadoInsumos } from './_components/AssociadoInsumos'

export default async function InsumosPage() {
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
        title="Insumos & Equipamentos"
        description={
          isAdmin
            ? 'Gerencie o patrimônio da associação'
            : 'Consulte e solicite uso de equipamentos e insumos'
        }
      />
      {isAdmin ? <AdminInsumos /> : <AssociadoInsumos />}
    </div>
  )
}
