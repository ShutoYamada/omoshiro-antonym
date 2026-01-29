# ---- build ----
FROM node:20-slim AS build
WORKDIR /app
RUN corepack enable

# ★追加：実行時に query engine をロードするのに必要
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     openssl libssl3 ca-certificates \
#     && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# COPY packages ./packages
COPY services ./services

RUN pnpm install --frozen-lockfile

# API build
RUN pnpm -C services/api build


# ---- runtime ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# ★追加：実行時に query engine をロードするのに必要
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     openssl libssl3 ca-certificates \
#     && rm -rf /var/lib/apt/lists/*

# ルートの pnpm ストア(.pnpm)を含むので必須
COPY --from=build /app/node_modules ./node_modules

# ★重要: services/api の node_modules が無いと fastify 等が確実に死ぬ
COPY --from=build /app/services/api/node_modules ./services/api/node_modules
COPY --from=build /app/services/api/dist ./services/api/dist

CMD ["node", "services/api/dist/index.js"]