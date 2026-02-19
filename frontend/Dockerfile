# Multi-stage build for AEGIS Studio Frontend
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.vite ./node_modules/.vite

# Expose port
EXPOSE 5173

# Run preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
