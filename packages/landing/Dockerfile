FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.6.12 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/landing/package.json ./packages/landing/

RUN pnpm install --frozen-lockfile --filter @pantera-negra/landing

COPY packages/landing ./packages/landing

RUN pnpm --filter @pantera-negra/landing build

# Production: nginx to serve static files
FROM nginx:alpine AS production

COPY --from=builder /app/packages/landing/dist /usr/share/nginx/html

# SPA routing support
RUN printf 'server {\n\
  listen 8080;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  gzip on;\n\
  gzip_types text/css application/javascript application/json image/svg+xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
