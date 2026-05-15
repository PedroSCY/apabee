# ─────────────────────────────────────────────────────────────────────────────
# Contexto de build: raiz do monorepo (apabee/)
#   docker build -f apps/web/Dockerfile -t apabee-web .
# ─────────────────────────────────────────────────────────────────────────────
# O web (Next.js) NÃO depende de @apa/core nem @apa/shared.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ─── Estágio 1: Pruner ───────────────────────────────────────────────────────
FROM base AS pruner
RUN npm install --global turbo@2
COPY . .
RUN turbo prune web --docker

# ─── Estágio 2: Installer ────────────────────────────────────────────────────
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install --legacy-peer-deps

# ─── Estágio 3: Builder ──────────────────────────────────────────────────────
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_PATH=/app/node_modules
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN cd apps/web && npm run build

# ─── Estágio 4: Runner ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
