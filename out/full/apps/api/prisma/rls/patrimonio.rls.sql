-- RLS — Módulo Patrimônio
-- Executar no SQL Editor do Supabase após prisma migrate dev.
-- O NestJS/Prisma conecta como service_role (bypassa RLS).
-- As policies protegem acesso direto via Supabase client (frontend ou PostgREST).

ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE atribuicoes_patrimonio ENABLE ROW LEVEL SECURITY;

-- ── equipamentos ──────────────────────────────────────────────────────────────

-- ADMIN: acesso total (CRUD)
CREATE POLICY "equipamentos_admin_all"
  ON equipamentos FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ASSOCIADO: leitura de todos (para ver disponibilidade)
CREATE POLICY "equipamentos_associado_select"
  ON equipamentos FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ASSOCIADO');

-- ── insumos ───────────────────────────────────────────────────────────────────

-- ADMIN: acesso total (CRUD)
CREATE POLICY "insumos_admin_all"
  ON insumos FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ASSOCIADO: leitura de todos (para ver disponibilidade)
CREATE POLICY "insumos_associado_select"
  ON insumos FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ASSOCIADO');

-- ── atribuicoes_patrimonio ────────────────────────────────────────────────────

-- ADMIN: acesso total (criar, atualizar, encerrar atribuições)
CREATE POLICY "atribuicoes_admin_all"
  ON atribuicoes_patrimonio FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ASSOCIADO: leitura apenas das próprias atribuições
-- associado_id é FK para associados.id, que por sua vez liga ao usuario_id = auth.uid()
CREATE POLICY "atribuicoes_associado_select_own"
  ON atribuicoes_patrimonio FOR SELECT
  USING (
    associado_id IN (
      SELECT id FROM associados WHERE usuario_id = auth.uid()::text
    )
  );
