# multi-stage build: builder + runner
FROM node:20-alpine AS builder
RUN apk add --no-cache git build-base
WORKDIR /app

COPY Backend/package*.json ./
COPY Backend/package-lock.json ./
RUN npm ci

COPY Backend/ ./

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY Backend/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 5000
CMD ["sh", "./start.sh"]

