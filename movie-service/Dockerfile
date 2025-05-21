FROM node:14-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src src/

# Set environment variables
ENV NODE_ENV=production

# Start the service
CMD ["npm", "start"]