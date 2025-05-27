# Use an official Node.js runtime as a parent image (consider project's Node version)
# Using LTS version Alpine for smaller size
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
# To leverage Docker cache for dependencies
COPY package*.json ./
# If using yarn, copy yarn.lock instead and use yarn install
# COPY package.json yarn.lock ./

# Install app dependencies
# Use --only=production if you don't need devDependencies in the final image
# RUN npm ci --only=production
RUN npm install
# If using yarn: RUN yarn install --frozen-lockfile --production=true

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
# If using yarn: COPY --from=builder /app/package.json /app/yarn.lock ./

# Install production dependencies only
RUN npm ci --only=production
# If using yarn: RUN yarn install --frozen-lockfile --production=true

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
# Copy .env file (or rely on docker-compose env_file)
# COPY .env . # Be cautious about including .env directly in the image

# Expose the port the app runs on (get from .env or default)
# The actual port mapping is done in docker-compose.yml
EXPOSE ${PORT:-3000}

# Define the command to run the app
CMD ["node", "dist/index.js"]

