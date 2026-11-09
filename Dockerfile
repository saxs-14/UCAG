# Packaged, runnable image for this repo's "Packages" tab -- the actual
# production deployment stays Vercel's own git-linked build (see
# CLAUDE.md's Deployment section); this is a self-contained artifact for
# anyone who wants to run UCAG outside Vercel. Three-stage build on
# next.config.ts's output: "standalone" so the final image ships a
# minimal server.js + only the node_modules it actually needs, not the
# whole repo.
#
# NEXT_PUBLIC_* values are baked in at build time (a Next.js constraint,
# not a choice made here) -- this image is built the same no-real-
# credentials way CI builds the app (see .github/workflows/ci.yml),
# matching this project's own documented AuthProvider degrade-gracefully
# path (CLAUDE.md: "No real Firebase project is connected, so
# AuthProvider degrades gracefully"). To run this against a real Firebase
# project, rebuild with your own NEXT_PUBLIC_FIREBASE_* build args rather
# than trying to inject them at `docker run` time.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
ENV CRON_SECRET=docker-build-placeholder
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
