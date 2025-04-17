FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

EXPOSE 5173

# Start in development mode with hot reloading
CMD ["npm", "run", "dev"]
