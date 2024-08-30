# syntax = docker/dockerfile:1.2

FROM node:18-alpine as base 

RUN apk update && \
    apk add libc6-compat && \
    apk add make gcc g++ python3

RUN yarn global add turbo

FROM base AS deps

WORKDIR /usr/src/app

COPY . .

RUN turbo prune exma --docker

FROM base as builder

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/out/json/ .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY --from=deps /usr/src/app/out/full/ .

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn cd apps/exma && yarn install

RUN yarn turbo run build --filter=exma

FROM base as runner 

WORKDIR /usr/src/app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs  /usr/src/app/apps/exma/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs  /usr/src/app/apps/exma/.next/static ./apps/exma/.next/static
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/exma/public ./apps/exma/public

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD  node apps/exma/server.js