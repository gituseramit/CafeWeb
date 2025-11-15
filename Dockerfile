# Multi-stage build for full-stack application
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend code
COPY backend/ ./

# Frontend build stage
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files and config files first (for better caching)
COPY frontend/package*.json ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./

# Install frontend dependencies
RUN npm ci

# Copy rest of frontend code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy backend package files (including package-lock.json if it exists)
COPY --from=backend-builder /app/backend/package*.json ./backend/
# Install production dependencies for backend (skip if package-lock.json doesn't exist)
RUN cd backend && (npm ci --only=production || npm install --only=production) || true

# Copy backend
COPY --from=backend-builder /app/backend ./backend

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create uploads directory
RUN mkdir -p backend/uploads backend/temp

# Expose port
EXPOSE 5000

# Set working directory to backend
WORKDIR /app/backend

# Start backend server
CMD ["node", "server.js"]

