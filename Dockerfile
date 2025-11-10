# Base image
FROM node

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

RUN npm run build

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "run", "start"]
