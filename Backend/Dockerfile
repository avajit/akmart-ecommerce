# Backend Dockerfile for production
# Builds TypeScript to JavaScript, generates Prisma client, and runs node in production

FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat git
WORKDIR /app

# Copy package files and install dependencies
COPY Backend/package*.json ./
# If you use a lockfile, copy it too (optional)
COPY Backend/package-lock.json ./ 2>/dev/null || true
RUN npm ci

# Copy the rest of the backend source
COPY Backend/ ./

# Build TypeScript
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Remove dev dependencies to reduce final image size
RUN npm prune --production

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built files and production deps from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema & client (if needed at runtime)
COPY --from=builder /app/prisma ./prisma

# Expose the port your server listens on (adjust if different)
EXPOSE 4000

CMD ["node", "dist/server.js"]
