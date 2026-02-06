# Build and serve React + Vite frontend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (including dev dependencies for vite preview)
RUN corepack enable \
  && corepack prepare yarn@4.9.1 --activate \
  && yarn install --immutable

# Copy source code
COPY . .

# Build the application (skip TypeScript checking for Docker deployment)
RUN yarn build

# Expose port 3000 (Vite preview default port)
EXPOSE 3000

# Start Vite preview server to serve built files
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3000"]
