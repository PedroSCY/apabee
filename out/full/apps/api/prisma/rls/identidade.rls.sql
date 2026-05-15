-- RLS — Módulo Identidade
-- Executar no SQL Editor do Supabase após criar as tabelas via Prisma migrate.
-- O NestJS/Prisma conecta como service_role (bypassa RLS).
-- As policies protegem acesso direto via Supabase client (frontend ou PostgREST).

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE associados ENABLE ROW LEVEL SECURITY;

-- ── usuarios ──────────────────────────────────────────────────────────────────

-- ADMIN: acesso total
CREATE POLICY "usuarios_admin_all"
  ON usuarios FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ASSOCIADO: leitura apenas do próprio registro
-- usuarios.id = auth.uid() pois o UUID do Supabase Auth é usado como PK
CREATE POLICY "usuarios_associado_select_own"
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id);

-- ── associados ────────────────────────────────────────────────────────────────

-- ADMIN: acesso total
CREATE POLICY "associados_admin_all"
  ON associados FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ASSOCIADO: leitura apenas do próprio registro
CREATE POLICY "associados_associado_select_own"
  ON associados FOR SELECT
  USING (auth.uid()::text = usuario_id);
