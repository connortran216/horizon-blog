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

# Expose port 3000
EXPOSE 3000

# Serve built files and inject crawler-visible metadata for blog detail routes
CMD ["yarn", "preview:meta"]
