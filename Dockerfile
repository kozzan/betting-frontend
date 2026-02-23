# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
# 1. Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# 2. Copy all project files (including tailwind and postcss configs)
COPY . .

# Set environment variables for the build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# Run the build to generate the standalone folder and static assets
RUN bun run build

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# 1. Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2. Copy static files (The CSS/JS chunks)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. Copy public folder ONLY if it exists (using a conditional check)
# Alternatively, create a dummy folder in Stage 2 to prevent this error
COPY --from=builder --chown=nextjs:nodejs /app/public* ./public/

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]