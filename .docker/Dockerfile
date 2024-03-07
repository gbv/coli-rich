FROM node:14-alpine

WORKDIR /usr/src/app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Build frontend
RUN npm run build

# Use pm2 to run app
RUN npm i -g pm2

ENV NODE_ENV=production

# Configuration
RUN mkdir /config
ENV CONFIG_FILE=/config/config.json

CMD pm2-runtime ecosystem.config.json
