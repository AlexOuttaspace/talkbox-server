FROM node:10-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp

COPY . ./

ENV PORT=80
EXPOSE 80
CMD ["npm", "start"]