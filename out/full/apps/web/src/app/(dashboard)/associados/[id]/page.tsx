import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AssociadoDetailClient } from './_components/AssociadoDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AssociadoDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | undefined
  if (role !== 'ADMIN') redirect('/dashboard')

  return <AssociadoDetailClient associadoId={id} />
}
