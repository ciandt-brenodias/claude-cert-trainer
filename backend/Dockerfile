FROM node:22-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared/src ./shared/src/
COPY backend/package.json backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY backend/src ./backend/src/
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@11 && \
    pnpm install --frozen-lockfile && \
    pnpm --filter shared build && \
    pnpm --filter backend exec prisma generate && \
    pnpm --filter backend run build


FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/pnpm-workspace.yaml /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/shared ./shared/
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist/
COPY --from=builder /app/backend/prisma ./backend/prisma/
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/backend/node_modules ./backend/node_modules/

WORKDIR /app/backend

CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node -r tsconfig-paths/register prisma/seed.ts; node dist/main"]
