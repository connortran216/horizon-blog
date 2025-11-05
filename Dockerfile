# Build and serve React + Vite frontend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for vite preview)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application (skip TypeScript checking for Docker deployment)
RUN npx vite build

# Expose port 3000 (Vite preview default port)
EXPOSE 3000

# Start Vite preview server to serve built files
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
