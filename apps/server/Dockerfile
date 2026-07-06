# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /repo
RUN corepack enable

# ---- deps: install full workspace so pnpm can resolve internal packages ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY apps/server/package.json apps/server/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

# ---- build: generate the Prisma client and compile the Nest app ----
FROM deps AS build
COPY packages packages
COPY apps/server apps/server
RUN pnpm --filter server prisma:generate
RUN pnpm --filter server build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/node_modules /repo/node_modules
COPY --from=build /repo/packages /repo/packages
COPY --from=build /repo/apps/server/node_modules /repo/apps/server/node_modules
COPY --from=build /repo/apps/server/dist /repo/apps/server/dist
COPY --from=build /repo/apps/server/prisma /repo/apps/server/prisma
COPY --from=build /repo/apps/server/package.json /repo/apps/server/package.json

WORKDIR /repo/apps/server
EXPOSE 5000
CMD ["node", "dist/src/main"]
