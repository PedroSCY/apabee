# ─────────────────────────────────────────────────────────────────────────────
# Contexto de build: raiz do monorepo (apabee/)
#   docker build -f apps/web/Dockerfile -t apabee-web .
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# ─── Estágio 1: Installer ────────────────────────────────────────────────────
FROM base AS installer
WORKDIR /app/apps/web
COPY apps/web/package.json ./
# @supabase/supabase-js é peer dep do @supabase/ssr (era hoisted do @apa/api
# no monorepo). No install standalone precisamos instalá-la explicitamente.
RUN npm install --legacy-peer-deps && npm install @supabase/supabase-js

# ─── Estágio 2: Builder ──────────────────────────────────────────────────────
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/web
COPY --from=installer /app/apps/web/node_modules ./node_modules
COPY apps/web ./
RUN npm run build

# ─── Estágio 3: Runner ───────────────────────────────────────────────────────
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
