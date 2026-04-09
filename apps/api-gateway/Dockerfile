# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/observability/package.json ./packages/observability/
COPY packages/redis/package.json ./packages/redis/
COPY apps/api-gateway/ ./apps/api-gateway/
COPY packages/common/ ./packages/common/
COPY packages/observability/ ./packages/observability/
COPY packages/redis/ ./packages/redis/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @saganet/api-gateway... build

FROM node:20-alpine AS production
WORKDIR /app/apps/api-gateway
ENV NODE_ENV=production
RUN corepack enable
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api-gateway/node_modules ./node_modules
COPY --from=builder /app/pnpm-workspace.yaml /app/package.json /app/
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
