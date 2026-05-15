import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@apabee.org.br'
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@2025!'
const NOME = process.env.SEED_ADMIN_NOME ?? 'Administrador'

// IDs estáveis — seed é idempotente (pode rodar várias vezes)
const FLORADAS = [
  { id: 'florada-laranjeira-seed', nome: 'Laranjeira', descricao: 'Florada de laranjeira' },
  { id: 'florada-eucalipto-seed', nome: 'Eucalipto', descricao: 'Florada de eucalipto' },
  { id: 'florada-silvestre-seed', nome: 'Silvestre', descricao: 'Vegetação nativa variada' },
  { id: 'florada-aroeira-seed', nome: 'Aroeira', descricao: 'Florada de aroeira' },
  { id: 'florada-outro-seed', nome: 'Outro', descricao: 'Outros tipos de florada' },
]

const TIPOS_MATERIA_PRIMA = [
  { id: 'tipo-mel-seed', nome: 'Mel', unidade: 'KG', descricao: 'Mel de abelha in natura' },
  { id: 'tipo-cera-seed', nome: 'Cera de Abelha', unidade: 'KG', descricao: 'Cera de abelha bruta' },
  { id: 'tipo-propolis-seed', nome: 'Própolis', unidade: 'KG', descricao: 'Extrato bruto de própolis' },
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

  // ── Admin ─────────────────────────────────────────────────────────────────
  console.log('→ Admin...')

  const existingAdmin = await prisma.usuario.findFirst({ where: { role: 'ADMIN' } })

  if (existingAdmin) {
    console.log(`  já existe: ${existingAdmin.email}`)
  } else {
    // Tenta encontrar o usuário no Supabase Auth pelo email (caso o banco foi resetado mas Auth não)
    const { data: listData } = await supabase.auth.admin.listUsers()
    const authUser = listData?.users.find(u => u.email === EMAIL)

    let userId: string

    if (authUser) {
      console.log('  usuário Auth já existe, reutilizando ID')
      userId = authUser.id
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        app_metadata: { role: 'ADMIN' },
      })
      if (authError) throw new Error(`Supabase Auth: ${authError.message}`)
      userId = authData.user.id
    }

    await prisma.usuario.create({
      data: { id: userId, nome: NOME, email: EMAIL, role: 'ADMIN' },
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
