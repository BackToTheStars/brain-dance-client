# Next.js production-образ, см. docs/deploy/02-core-services.md.
# NEXT_PUBLIC_* зашиваются на этапе next build → передавать как build-args:
#   docker build -t bd-client . \
#     --build-arg NEXT_PUBLIC_API_URL=https://server.brain-dance.net \
#     --build-arg NEXT_PUBLIC_LOBBY_API_URL=https://server.brain-dance.net \
#     --build-arg NEXT_PUBLIC_STATIC_MEDIA_URL=https://media.brain-dance.net
# npm ci с --legacy-peer-deps — пиры Storybook 10 (см. client/docs/changes.md).
FROM node:22-alpine AS build
WORKDIR /app

# scripts/ нужен до установки: postinstall копирует статику pdf.js
# (воркер + шрифты) из node_modules в public/
COPY package*.json ./
COPY scripts ./scripts
RUN npm ci --legacy-peer-deps

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LOBBY_API_URL
ARG NEXT_PUBLIC_STATIC_MEDIA_URL
ARG NEXT_PUBLIC_E2E
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_LOBBY_API_URL=$NEXT_PUBLIC_LOBBY_API_URL \
    NEXT_PUBLIC_STATIC_MEDIA_URL=$NEXT_PUBLIC_STATIC_MEDIA_URL \
    NEXT_PUBLIC_E2E=$NEXT_PUBLIC_E2E

RUN npm run build

ENV NODE_ENV=production
EXPOSE 5020
CMD ["npm", "start"]
