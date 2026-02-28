# e-summit-2k26-roots — Next.js admin dashboard
FROM oven/bun:1-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN bun run build

# Production image (Next.js standalone)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3012
EXPOSE 3012

WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
