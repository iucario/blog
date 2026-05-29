# Dependency installation stage (shared by dev and prod)
FROM node:lts AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Dev stage: run astro dev with src/data mounted at runtime
FROM deps AS dev
COPY . .
EXPOSE 4321
CMD ["node_modules/.bin/astro", "dev", "--host", "0.0.0.0"]

# Build stage: produce static output
FROM deps AS build
COPY . .
RUN pnpm run build

# Production stage: serve static files via nginx
FROM nginx:mainline-alpine-slim AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
