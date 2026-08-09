FROM node:24 AS build

WORKDIR /app

COPY . .

RUN npm i -g pnpm
ENV CI=true
RUN pnpm install --frozen-lockfile
RUN pnpm run storybook:build

FROM nginx:1.27.0-alpine AS final

COPY --from=build /app/storybook-static /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
