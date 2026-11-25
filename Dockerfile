FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/dist ./dist
COPY serve.mjs ./
USER node
EXPOSE 8080
CMD ["node", "serve.mjs"]
