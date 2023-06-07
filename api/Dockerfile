# FROM python:3.12-rc-slim-bullseye as dev
# greenlet failed to build
FROM python:3.11.3-slim-bullseye as dev

FROM python as builder

COPY ./requirements .

RUN pip wheel --wheel-dir /usr/src/app/prod/wheels -r prod.txt
RUN pip wheel --wheel-dir /usr/src/app/dev/wheels -r dev.txt

FROM python as release-deps

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# TODO: rename user --> fitness_tracker_user
RUN adduser user

COPY --from=builder /usr/src/app/prod/wheels /wheels/

RUN set -ex \
    && pip install \
        --no-cache-dir \
        --no-index \
        --find-links=/wheels/ \
        /wheels/* \
    && rm -rf /wheels/ \
    && chown -R user:user /app

FROM release-deps as dev-deps

COPY --from=builder /usr/src/app/dev/wheels /wheels/

RUN set -ex \
    && pip install \
        --no-cache-dir \
        --no-index \
        --find-links=/wheels/ \
        /wheels/* \
    && rm -rf /wheels/

FROM release-deps as release

# TODO:                    why 766?
COPY --chown=user:user --chmod=766 ./docker/prod/start /
COPY --chown=user:user . /app

USER user
CMD /start

FROM dev-deps as dev

USER root

# TODO:                    why 766?
COPY --chown=user:user --chmod=766 ./docker/dev/entrypoint ./docker/dev/start /
COPY --chown=user:user . /app

USER user

ENTRYPOINT ["/entrypoint"]
CMD /start

FROM release
