# ─────────────────────────────────────────────────────────────────────────────
# Contexto de build: raiz do monorepo (apabee/)
# Railway config:   Dockerfile Path = apps/api/Dockerfile | Build Context = .
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ─── Estágio 1: Pruner ───────────────────────────────────────────────────────
FROM base AS pruner
RUN npm install --global turbo@2
COPY . .
RUN turbo prune @apa/api --docker

# ─── Estágio 2: Installer ────────────────────────────────────────────────────
# O npm ci instala deps em dois lugares dependendo do hoisting:
#   /app/node_modules/           → packages hoistados (prisma, rxjs, etc.)
#   /app/apps/api/node_modules/  → packages NÃO hoistados (@nestjs/cli, @swc/*)
FROM base AS installer
COPY --from=pruner /app/out/json/ .
# turbo prune copies apps/web/package.json (glob workspaces) but the pruned
# lockfile has no web deps — remove it so npm ci does not fail.
RUN rm -rf apps/web
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# ─── Estágio 3: Builder ──────────────────────────────────────────────────────
# CAUSA RAIZ: @nestjs/cli não é hoistado para /app/node_modules pelo npm
# workspaces — confirmado: `@nestjs/cli in root lock: false`.
# Ele fica em /app/apps/api/node_modules (workspace-level).
#
# CORREÇÃO: copiar AMBOS os node_modules do installer e incluir os dois no PATH.
FROM base AS builder
ENV PATH="/app/node_modules/.bin:/app/apps/api/node_modules/.bin:$PATH"
COPY --from=installer /app/node_modules          ./node_modules
COPY --from=installer /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=pruner    /app/out/full/             .
RUN cd packages/shared && tsc --project tsconfig.lib.json
RUN cd packages/core   && tsc --project tsconfig.lib.json
RUN cd apps/api && prisma generate && nest build

# ─── Estágio 4: Runner ───────────────────────────────────────────────────────
# Imagem final de produção — sem devDeps, sem código TypeScript.
# Runtime: @apa/core e @apa/shared são resolvidos via symlinks de workspace
# que apontam para packages/{core,shared}/dist/ (compilados no builder).
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

COPY --from=pruner /app/out/json/ .
RUN rm -rf apps/web
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

COPY --from=builder /app/packages/core/dist   ./packages/core/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma      ./apps/api/prisma
COPY --from=builder /app/apps/api/dist        ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/src/main"]
