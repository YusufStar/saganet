# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/db/package.json ./packages/db/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/observability/package.json ./packages/observability/
COPY packages/redis/package.json ./packages/redis/
COPY apps/payment-service/ ./apps/payment-service/
COPY packages/common/ ./packages/common/
COPY packages/db/ ./packages/db/
COPY packages/kafka/ ./packages/kafka/
COPY packages/observability/ ./packages/observability/
COPY packages/redis/ ./packages/redis/
COPY infra/docker/entrypoint.sh ./infra/docker/entrypoint.sh
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @saganet/payment-service... build

FROM node:20-alpine AS production
WORKDIR /app/apps/payment-service
ENV NODE_ENV=production
RUN corepack enable
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/payment-service/node_modules ./node_modules
COPY --from=builder /app/pnpm-workspace.yaml /app/package.json /app/
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/payment-service/dist ./dist
COPY --from=builder /app/apps/payment-service/package.json ./
COPY --from=builder /app/infra/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 3005
CMD ["sh", "entrypoint.sh"]
