# Serve pre-built static files with nginx
# Build locally first: pnpm build:landing
FROM nginx:alpine

COPY dist /usr/share/nginx/html

RUN printf 'server {\n\
  listen 8080;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  gzip on;\n\
  gzip_types text/css application/javascript application/json image/svg+xml;\n\
  add_header Cache-Control "public, max-age=31536000" /assets;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
