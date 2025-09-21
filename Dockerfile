# Stage 1: build
FROM node:22-alpine AS builder

WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies (including devDeps so build works)
RUN npm ci

# copy all source
COPY . .

# build the app
RUN npm run build

# prune dev dependencies (optional)
RUN npm prune --production

# Stage 2: runtime
FROM node:22-alpine

WORKDIR /app

# Copy in only what is needed from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "build"]