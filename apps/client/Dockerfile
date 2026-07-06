# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY apps/client/package.json apps/client/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

COPY packages packages
COPY apps/client apps/client

WORKDIR /repo/apps/client
EXPOSE 5173
CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0"]
