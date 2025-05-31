FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
# RUN apt-get update && apt-get install -y wait-for-it
# CMD ["wait-for-it", "mongodb:27017", "--", "npm", "start"]