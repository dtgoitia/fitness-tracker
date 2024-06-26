FROM node:22.3.0-slim

USER node

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm ci

ENV PATH ./node_modules/.bin/:$PATH
