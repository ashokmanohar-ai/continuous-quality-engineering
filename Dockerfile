# syntax=docker/dockerfile:1.7
FROM node:22.22.0-alpine3.22 AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY tsconfig.json tsconfig.build.json ./
COPY demo-app ./demo-app
RUN npm run build

FROM node:22.22.0-alpine3.22 AS runtime
ENV NODE_ENV=production APP_HOST=0.0.0.0 APP_PORT=3000 APP_DB=/app/data/acme-orders.db
WORKDIR /app
RUN mkdir -p /app/data && chown -R node:node /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /workspace/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/demo-app/src/server.js"]
