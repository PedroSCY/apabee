# ─────────────────────────────────────────────────────────────────────────────
# Contexto de build: raiz do monorepo (apabee/)
# Railway config:   Dockerfile Path = apps/api/Dockerfile | Build Context = .
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
# libc6-compat garante compatibilidade de binários nativos no Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ─── Estágio 1: Pruner ───────────────────────────────────────────────────────
# Gera um subconjunto mínimo do monorepo contendo apenas o que @apa/api precisa.
# Saída: out/json (só package.json) e out/full (código fonte completo).
FROM base AS pruner
RUN npm install --global turbo@2
COPY . .
RUN turbo prune @apa/api --docker

# ─── Estágio 2: Installer ────────────────────────────────────────────────────
# Instala TODAS as dependências (dev incluídas) para que o build funcione.
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# ─── Estágio 3: Builder ──────────────────────────────────────────────────────
# 1. Gera o Prisma Client a partir do schema (não precisa de banco)
# 2. Turbo builda na ordem: @apa/shared → @apa/core → @apa/api
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN cd apps/api && npx prisma generate
RUN npx turbo run build --filter=@apa/api

# ─── Estágio 4: Runner ───────────────────────────────────────────────────────
# Imagem final de produção: sem devDeps, sem código fonte TypeScript.
#
# Por que packages/core e packages/shared precisam estar aqui:
# A API usa SWC (não webpack), então @apa/core e @apa/shared NÃO são bundled
# no dist/. Node.js os resolve em runtime via symlinks em node_modules/@apa/*.
# Os symlinks apontam para packages/{core,shared}/dist/index.js.
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

# Reinstala apenas dependências de produção (recria os symlinks de workspace)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

# Packages internos compilados — os symlinks em node_modules/@apa/* apontam aqui
COPY --from=builder /app/packages/core/dist     ./packages/core/dist
COPY --from=builder /app/packages/shared/dist   ./packages/shared/dist

# Prisma Client gerado (binário nativo) + schema para runtime
COPY --from=builder /app/node_modules/.prisma   ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma        ./apps/api/prisma

# API compilada pelo SWC
COPY --from=builder /app/apps/api/dist          ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
