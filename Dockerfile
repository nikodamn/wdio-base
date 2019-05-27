FROM node:10-alpine

EXPOSE 4444

RUN apk update && apk add --no-cache git

COPY package.json .

RUN yarn

COPY . .
