# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/db/package.json ./packages/db/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/observability/package.json ./packages/observability/
COPY packages/redis/package.json ./packages/redis/
COPY packages/storage/package.json ./packages/storage/
COPY apps/auth-service/ ./apps/auth-service/
COPY packages/common/ ./packages/common/
COPY packages/db/ ./packages/db/
COPY packages/kafka/ ./packages/kafka/
COPY packages/observability/ ./packages/observability/
COPY packages/redis/ ./packages/redis/
COPY packages/storage/ ./packages/storage/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @saganet/auth-service build

FROM node:20-alpine AS production
WORKDIR /app/apps/auth-service
ENV NODE_ENV=production
RUN corepack enable
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/package.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
