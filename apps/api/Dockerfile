FROM node:22-alpine
WORKDIR /repo

RUN corepack enable

COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter @valence/api...

COPY tsconfig.base.json ./
COPY apps/api apps/api
RUN pnpm --filter @valence/api build

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
