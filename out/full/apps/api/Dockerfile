# ─────────────────────────────────────────────────────────────────────────────
# Contexto de build: raiz do monorepo (apabee/)
#   docker build -f apps/api/Dockerfile -t apabee-api .
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
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# ──────────────────────────────────────────────────────────────────────────────
# FIX: turbo prune --docker remove devDependencies do out/json/.
#      O builder SWC do NestJS precisa de @swc/cli e @swc/core (devDeps).
#      Lê o package.json original do apps/api e reinstala as devDeps
#      perdidas pelo prune.
# ──────────────────────────────────────────────────────────────────────────────
RUN npm ci && node /tmp/restore-dev-deps.js
COPY <<"HEREDOC" /tmp/restore-dev-deps.js
const dev = require('./apps/api/package.json').devDependencies || {};
const existing = { ...require('./package.json').dependencies, ...require('./package.json').devDependencies };
const missing = Object.entries(dev).filter(([k]) => !existing[k]);
if (missing.length) {
  const { execSync } = require('child_process');
  execSync('npm install ' + missing.map(([k, v]) => k + '@' + v.replace(/^\^/, '')).join(' '), { stdio: 'inherit' });
}
HEREDOC

# ─── Estágio 3: Builder ──────────────────────────────────────────────────────
FROM base AS builder
ENV PATH="/app/node_modules/.bin:$PATH"
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN npm install --global @nestjs/cli
RUN cd packages/shared && tsc --project tsconfig.lib.json
RUN cd packages/core  && tsc --project tsconfig.lib.json
RUN cd apps/api && prisma generate && nest build

# ─── Estágio 4: Runner ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production PORT=3001

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

COPY --from=builder /app/packages/core/dist     ./packages/core/dist
COPY --from=builder /app/packages/shared/dist   ./packages/shared/dist
COPY --from=builder /app/node_modules/.prisma   ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma        ./apps/api/prisma
COPY --from=builder /app/apps/api/dist          ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
