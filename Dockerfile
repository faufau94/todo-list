FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ───── Image finale ─────
FROM node:22-alpine

WORKDIR /app

# On copie le build Nuxt et les fichiers de migration
COPY --from=builder /app/.output ./output
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

# Nuxt génère un serveur Node standalone, pas besoin de yarn ici
CMD ["node", "./output/server/index.mjs"]
