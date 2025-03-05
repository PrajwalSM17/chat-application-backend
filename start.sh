#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build TypeScript files
echo "Building TypeScript files..."
npm run build

# Start the server
echo "Starting server..."
npm start