# Multi-stage build for Pantera Negra monorepo
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.6.12 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api
COPY packages/web ./packages/web

# Build stage
FROM base AS build

# Build shared package first (dependency of api and web)
RUN pnpm --filter shared build

# Build web package
RUN pnpm --filter web build

# Build api package
RUN pnpm --filter api build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.6.12 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/api/dist ./packages/api/dist
COPY --from=build /app/packages/api/package.json ./packages/api/

# Copy PEM files if they exist (optional - JWT can use JWT_SECRET instead)
# JWT keys are provided via environment variables (JWT_PRIVATE_KEY_PEM / JWT_PUBLIC_KEY_PEM)

# Copy web dist to api public folder
COPY --from=build /app/packages/web/dist ./packages/api/public

# Set working directory to API
WORKDIR /app/packages/api

# Expose port 8080 (as per fly.toml)
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the API server
CMD ["node", "dist/index.js"]

