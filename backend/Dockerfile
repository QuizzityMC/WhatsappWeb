FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create auth directory
RUN mkdir -p auth_info_baileys

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
