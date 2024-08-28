# syntax = docker/dockerfile:1.2

FROM node:18-alpine as base 

RUN apk upgrade && \
    apk add libgcc libstdc++ && \ 
    apk add make gcc g++ python3

RUN yarn global add turbo

FROM base as builder

WORKDIR /usr/src/app

COPY . .

RUN  turbo prune watchdog --docker

FROM base as installer

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json/ .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY --from=builder /usr/src/app/out/full/ .
RUN yarn turbo run build --filter=watchdog

FROM base as runner 

WORKDIR /usr/src/app 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/ .

WORKDIR /usr/src/app/servers/watchdog

CMD node dist/index.cjs
