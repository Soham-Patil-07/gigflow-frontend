FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the optimized production static bundle assets
RUN npm run build

EXPOSE 5173

# Serve the static production application files locally on host ports
CMD ["npm", "run", "preview", "--", "--host"]