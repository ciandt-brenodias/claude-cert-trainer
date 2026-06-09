FROM node:22-alpine AS builder

WORKDIR /app

COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared/src ./shared/src/
COPY frontend/package.json frontend/vite.config.ts frontend/vitest.config.ts frontend/tsconfig.app.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/index.html ./frontend/
COPY frontend/src ./frontend/src/
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm install -g pnpm@11 && \
    pnpm install --frozen-lockfile && \
    pnpm --filter shared build && \
    pnpm --filter frontend run build


FROM nginx:alpine AS runner

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
