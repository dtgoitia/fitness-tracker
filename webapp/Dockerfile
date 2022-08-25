FROM node:14.16-stretch-slim

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

# Create and use a non-root user
# Reason: avoid creating files as root which then cause trouble to the host
RUN chown node:node .
USER node

RUN npm ci

ENV PATH ./node_modules/.bin/:$PATH
