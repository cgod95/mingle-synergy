# Multi-stage Dockerfile for production deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy security headers
COPY security-headers.conf /etc/nginx/security-headers.conf

# Set proper permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Development stage (optional)
FROM node:18-alpine AS development

WORKDIR /app

# Install all dependencies including dev dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 8080

# Start development server
CMD ["npm", "run", "dev"] 