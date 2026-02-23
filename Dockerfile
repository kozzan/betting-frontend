# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
# 1. Copy dependencies first
COPY --from=deps /app/node_modules ./node_modules
# 2. Copy EVERYTHING else (configs, tailwind, etc.)
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# Run the build - Next.js will look for tailwind.config.ts / postcss.config.js here
RUN bun run build

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# 1. The standalone folder contains the 'node_modules' and 'server.js'
COPY --from=builder /app/.next/standalone ./

# 2. These two lines are MANDATORY for CSS and Images to work:
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]