FROM node:10-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp \
    && apk add --no-cache bash

COPY . ./
COPY ./wait-for-it.sh .

ENV PORT=3020
EXPOSE 3020
CMD ["npm", "start"]