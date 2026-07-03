# Usa un'immagine di Node.js ottimizzata (versione 18, ottima per Next.js)
FROM node:18-alpine AS base

# Abilita pnpm, visto che il vostro progetto lo utilizza
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- FASE 1: Installazione delle dipendenze ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copiamo i file di configurazione dei pacchetti
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# ---- FASE 2: Compilazione (Build) ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disabilita la telemetria di Next.js per una build più pulita
ENV NEXT_TELEMETRY_DISABLED 1
# Avvia la build di Next.js
RUN pnpm run build

# ---- FASE 3: Esecuzione in Produzione (Runner) ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crea un utente non-root per sicurezza (best practice su cloud)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia i file statici
COPY --from=builder /app/public ./public

# Crea la cartella per la cache e assegna i permessi all'utente nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Grazie a output: "standalone", copiamo solo i file essenziali per far girare l'app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
# Obbligatorio su container per esporre l'app alla rete esterna
ENV HOSTNAME "0.0.0.0"

# Comando di avvio per l'app standalone
CMD ["node", "server.js"]