FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# Build TypeScript
FROM base AS builder
COPY package*.json tsconfig.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

# Production image
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/index.js"]
