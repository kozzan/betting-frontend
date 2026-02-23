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

# 1. Copy the standalone output (includes server.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2. Copy static files and public assets (CRITICAL for CSS/Images)
# These must be placed relative to the server.js in standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using node
CMD ["node", "server.js"]