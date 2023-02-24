# FROM python:3.12-rc-slim-bullseye as dev
# greenlet failed to build
FROM python:3.11.2-slim-bullseye as dev

ARG USER_ID
ARG GROUP_ID

ENV USER "apiuser"
ENV UID "${USER_ID}"
ENV GID "${GROUP_ID}"

ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Add rootless user
RUN addgroup $USER --gid $GID \
    && adduser \
        --uid $UID --gid $GID \
        --disabled-password \
        --disabled-login \
        $USER

# Add rootless user binaries dir to PATH - needed to recompile Python deps
ENV PATH "/home/${USER}/.local/bin:${PATH}"


USER $USER

COPY --chown=$USER:$USER ./requirements/dev.txt /requirements/dev.txt
RUN pip install -r /requirements/dev.txt \
    --no-cache-dir \
    && rm -rf /requirements/dev.txt

# COPY ./docker/dev/entrypoint /entrypoint
# RUN chmod +x /entrypoint

CMD ["echo", "hi"]
