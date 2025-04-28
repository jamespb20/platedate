# Use an official Node 16 runtime as a parent image
FROM node:18 as builder

# Set the working directory in the container for the backend
WORKDIR /app

# Copy backend package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the backend source code
COPY . .

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy frontend package.json and package-lock.json
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Build the frontend
RUN npm run build

# Set work directory back to root of backend to run build process for TypeScript
WORKDIR /app
RUN npx tsc

# Final image
FROM node:18

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/build ./frontend/build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 2082

# Command to run the app
CMD ["node", "dist/server.js"]
