# ── Build stage ───────────────────────────────────────────────
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy all application source files
COPY . .

# ── Runtime ───────────────────────────────────────────────────
# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
