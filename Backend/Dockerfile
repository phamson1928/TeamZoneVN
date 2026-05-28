# ================================
# Base stage
# ================================
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# ================================
# Dependencies stage
# ================================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ================================
# Development stage
# ================================
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ================================
# Build stage
# ================================
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ================================
# Production stage
# ================================
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install curl for healthcheck (tiny, ~200KB)
RUN apk add --no-cache curl

# Copy only necessary files
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/src/main.js"]
