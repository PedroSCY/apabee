import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/PublicHeader'
import { CartDrawer } from '@/components/public/CartDrawer'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/loja?login=required')

  const role = user.app_metadata?.role as string | undefined
  if (role && role !== 'CLIENTE') {
    // ADMIN/ASSOCIADO tentando acessar área de cliente — redireciona para o dashboard
    redirect('/dashboard')
  }

  return (
    <>
      <PublicHeader />
      <CartDrawer />
      <main className="min-h-screen bg-background">{children}</main>
    </>
  )
}
