import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared'
import { ProdutosClient } from './_components/ProdutosClient'

export default async function ProdutosPage() {
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
        title={isAdmin ? 'Produtos & Loja' : 'Produtos'}
        description={
          isAdmin
            ? 'Gerencie o catálogo de produtos e estoques da associação'
            : 'Consulte e solicite produtos disponíveis na associação'
        }
      />
      <ProdutosClient isAdmin={isAdmin} />
    </div>
  )
}
