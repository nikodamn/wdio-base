FROM node:10-alpine

EXPOSE 4444

WORKDIR /

COPY package.json .

RUN yarn

COPY . .
