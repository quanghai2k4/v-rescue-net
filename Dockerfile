FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY server ./server

EXPOSE 5000

CMD ["node", "server/index.js"]
