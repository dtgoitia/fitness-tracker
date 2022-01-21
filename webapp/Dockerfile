FROM node:14.16-stretch-slim

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

RUN apt-get update \
    && apt-get -yy install build-essential python \
    && npm ci \
    && apt-get purge --auto-remove -yy $(cat /var/log/apt/history.log | tail -n 2 | head -n 1 | sed -e 's,: ,\n,' -e 's/:[a-z]\|), /\n/g' | awk 'NR % 2 == 0') \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PATH ./node_modules/.bin/:$PATH
