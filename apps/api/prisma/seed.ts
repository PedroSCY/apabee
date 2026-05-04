import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@apabee.org.br'
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@2025!'
const NOME = process.env.SEED_ADMIN_NOME ?? 'Administrador'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = new PrismaClient({ adapter } as any)

  const supabase = createClient(
    process.env.SUPABASE_PROJECT_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  console.log('\n--- Apabee seed: admin ---\n')

  const existing = await prisma.usuario.findFirst({ where: { role: 'ADMIN' } })
  if (existing) {
    console.log(`Admin ja existe: ${existing.email}`)
    console.log('Para recriar, remova o usuario no Supabase Auth e na tabela usuarios e rode novamente.')
    await prisma.$disconnect()
    await pool.end()
    return
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: { role: 'ADMIN' },
  })

  if (authError) throw new Error(`Supabase Auth: ${authError.message}`)

  await prisma.usuario.create({
    data: {
      id: authData.user.id,
      nome: NOME,
      email: EMAIL,
      role: 'ADMIN',
    },
  })

  console.log('Admin criado com sucesso!')
  console.log(`  Email : ${EMAIL}`)
  console.log(`  Senha : ${PASSWORD}`)
  console.log('\n  Troque a senha apos o primeiro acesso.\n')

  await prisma.$disconnect()
  await pool.end()
}

main().catch((err) => {
  console.error('Erro no seed:', err)
  process.exit(1)
})
