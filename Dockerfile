# Multi-stage build for SvelteKit
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/build ./
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sveltekit -u 1001
USER sveltekit

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "index.js"]
