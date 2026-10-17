# Multi-Stage Production Dockerfile for Motohelp SCM Enterprise
# Unified deployment: High-Performance Express API, Real-Time SSE & Compiled React Frontend

# Stage 1: Frontend Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5050

# Required build tools for better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit

# Copy application backend, database schema, and compiled client bundle
COPY server/ ./server/
COPY database/ ./database/
COPY --from=builder /app/dist ./dist

# Persistent SQLite database volume
VOLUME ["/app/database"]

EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5050/api/health || exit 1

CMD ["node", "server/index.js"]