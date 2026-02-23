# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_API_URL is baked in at build time.
# Railway passes service environment variables as Docker build args automatically.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure public/ exists so the COPY in the runner stage never fails
RUN mkdir -p public && bun run build

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# 1. Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 2. Copy the static files INTO the .next/static folder
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 3. Copy the public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
