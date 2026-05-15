import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { AdminDocumentos } from './_components/AdminDocumentos'
import { AssociadoDocumentos } from './_components/AssociadoDocumentos'

export default async function DocumentosPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.app_metadata?.role as string | undefined) ?? 'ASSOCIADO'

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Documentos"
        description={
          role === 'ADMIN'
            ? 'Gerencie atas, relatórios e documentos da associação.'
            : 'Acesse atas, relatórios e documentos publicados pela APA.'
        }
      />
      {role === 'ADMIN' ? <AdminDocumentos /> : <AssociadoDocumentos />}
    </div>
  )
}
