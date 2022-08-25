FROM node:14.16-stretch-slim

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm ci

ENV PATH ./node_modules/.bin/:$PATH
