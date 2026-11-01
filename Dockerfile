# Multi-stage: build the Vite app from source at this exact commit, serve with nginx.
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG GIT_SHA=unknown
RUN pnpm build && echo "$GIT_SHA" > dist/DEPLOYED_SHA.txt

FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
