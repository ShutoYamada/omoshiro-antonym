# ---- build ----
FROM node:20-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services ./services
RUN pnpm install --frozen-lockfile
RUN pnpm -C services/api build


# ---- runtime ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/api/node_modules ./services/api/node_modules
COPY --from=build /app/services/api/dist ./services/api/dist

CMD ["node", "services/api/dist/index.js"]