FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env ./
RUN npm run build

CMD ["npm", "start"]