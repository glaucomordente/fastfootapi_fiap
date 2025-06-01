#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
npm run migration:run

# TypeORM will handle schema synchronization
# We're using synchronize: true in the TypeORM configuration for development
# For production, you would want to use migrations instead
echo "Database will be synchronized by TypeORM on application start..."

echo "Starting the application..."
exec "$@"
