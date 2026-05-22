import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@apabee.org.br'
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@2025!'
const NOME = process.env.SEED_ADMIN_NOME ?? 'Administrador'

// IDs estáveis em formato UUID v4 válido — seed é idempotente (pode rodar várias vezes)
const FLORADAS = [
  { id: '00000000-0000-4000-8000-000000000001', nome: 'Laranjeira', descricao: 'Florada de laranjeira' },
  { id: '00000000-0000-4000-8000-000000000002', nome: 'Eucalipto', descricao: 'Florada de eucalipto' },
  { id: '00000000-0000-4000-8000-000000000003', nome: 'Silvestre', descricao: 'Vegetação nativa variada' },
  { id: '00000000-0000-4000-8000-000000000004', nome: 'Aroeira', descricao: 'Florada de aroeira' },
  { id: '00000000-0000-4000-8000-000000000005', nome: 'Outro', descricao: 'Outros tipos de florada' },
]

const TIPOS_MATERIA_PRIMA = [
  { id: '00000000-0000-4000-8000-000000000011', nome: 'Mel', unidade: 'KG', descricao: 'Mel de abelha in natura' },
  { id: '00000000-0000-4000-8000-000000000012', nome: 'Cera de Abelha', unidade: 'KG', descricao: 'Cera de abelha bruta' },
  { id: '00000000-0000-4000-8000-000000000013', nome: 'Própolis', unidade: 'KG', descricao: 'Extrato bruto de própolis' },
]


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

  console.log('\n=== Apabee seed ===\n')

  // ── Limpeza do Supabase Auth (apenas quando o banco foi resetado) ──────────
  // prisma db push --force-reset limpa o schema público mas não o auth.users.
  // Se a tabela usuarios está vazia, o banco foi resetado — limpa Auth também.
  const userCount = await prisma.usuario.count()
  if (userCount === 0) {
    console.log('→ Banco vazio detectado — limpando Supabase Auth...')
    const { data: authList } = await supabase.auth.admin.listUsers()
    const authUsers = authList?.users ?? []
    for (const u of authUsers) {
      await supabase.auth.admin.deleteUser(u.id)
    }
    console.log(`  ${authUsers.length} usuário(s) Auth removido(s)`)
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  console.log('→ Admin...')

  const existingAdmin = await prisma.usuario.findFirst({ where: { role: 'ADMIN' } })

  if (existingAdmin) {
    console.log(`  já existe: ${existingAdmin.email}`)
  } else {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      app_metadata: { role: 'ADMIN' },
    })
    if (authError) throw new Error(`Supabase Auth: ${authError.message}`)

    await prisma.usuario.create({
      data: { id: authData.user.id, nome: NOME, email: EMAIL, role: 'ADMIN' },
    })

    console.log(`  criado: ${EMAIL} / ${PASSWORD}`)
  }

  // ── Floradas ──────────────────────────────────────────────────────────────
  console.log('→ Floradas...')
  for (const f of FLORADAS) {
    await prisma.florada.upsert({
      where: { id: f.id },
      update: {},
      create: { id: f.id, nome: f.nome, descricao: f.descricao, ativa: true },
    })
  }
  console.log(`  ${FLORADAS.length} floradas OK`)

  // ── Tipos de Matéria-Prima ────────────────────────────────────────────────
  console.log('→ Tipos de Matéria-Prima...')
  for (const t of TIPOS_MATERIA_PRIMA) {
    await prisma.tipoMateriaPrima.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, nome: t.nome, unidade: t.unidade as any, descricao: t.descricao },
    })
  }
  console.log(`  ${TIPOS_MATERIA_PRIMA.length} tipos OK`)

  console.log('\n=== Seed concluído ===\n')

  await prisma.$disconnect()
  await pool.end()
}

main().catch((err) => {
  console.error('Erro no seed:', err)
  process.exit(1)
})
