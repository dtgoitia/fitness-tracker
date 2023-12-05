FROM node:20.2.0-slim

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm ci

ENV PATH ./node_modules/.bin/:$PATH
