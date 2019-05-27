FROM node:10-alpine

EXPOSE 4444

COPY package.json .

RUN yarn

COPY . .
