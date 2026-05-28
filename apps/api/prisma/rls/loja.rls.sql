-- RLS — Módulo Loja
-- Executar no SQL Editor do Supabase após criar as tabelas via Prisma push.
-- O NestJS/Prisma conecta como service_role (bypassa RLS).
-- As policies protegem acesso direto via Supabase client (frontend ou PostgREST).

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_loja ENABLE ROW LEVEL SECURITY;

-- ── clientes ──────────────────────────────────────────────────────────────────

-- ADMIN: acesso total
CREATE POLICY "clientes_admin_all"
  ON clientes FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- CLIENTE: acesso apenas ao próprio registro (clientes.id = auth.uid())
CREATE POLICY "clientes_own_all"
  ON clientes FOR ALL
  USING  (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ── enderecos_entrega ─────────────────────────────────────────────────────────

-- ADMIN: acesso total
CREATE POLICY "enderecos_admin_all"
  ON enderecos_entrega FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- CLIENTE: acesso apenas aos próprios endereços
CREATE POLICY "enderecos_cliente_own"
  ON enderecos_entrega FOR ALL
  USING  (auth.uid()::text = cliente_id)
  WITH CHECK (auth.uid()::text = cliente_id);

-- ── pedidos_loja ──────────────────────────────────────────────────────────────

-- ADMIN: acesso total
CREATE POLICY "pedidos_loja_admin_all"
  ON pedidos_loja FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- CLIENTE: SELECT apenas dos próprios pedidos
CREATE POLICY "pedidos_loja_cliente_select"
  ON pedidos_loja FOR SELECT
  USING (auth.uid()::text = cliente_id);

-- CLIENTE: INSERT somente para o próprio clienteId
CREATE POLICY "pedidos_loja_cliente_insert"
  ON pedidos_loja FOR INSERT
  WITH CHECK (auth.uid()::text = cliente_id);

-- ── itens_pedido_loja ─────────────────────────────────────────────────────────

-- ADMIN: acesso total
CREATE POLICY "itens_pedido_loja_admin_all"
  ON itens_pedido_loja FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- CLIENTE: leitura dos itens dos próprios pedidos
CREATE POLICY "itens_pedido_loja_cliente_select"
  ON itens_pedido_loja FOR SELECT
  USING (
    pedido_loja_id IN (
      SELECT id FROM pedidos_loja WHERE cliente_id = auth.uid()::text
    )
  );

-- ── configuracao_loja ─────────────────────────────────────────────────────────

-- ADMIN: leitura e escrita total
CREATE POLICY "configuracao_loja_admin_all"
  ON configuracao_loja FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- Público: leitura da configuração (necessário para /loja/configuracao/publica sem auth)
-- Campos sensíveis não são expostos — o endpoint filtra apenas campos públicos
CREATE POLICY "configuracao_loja_public_select"
  ON configuracao_loja FOR SELECT
  USING (true);
