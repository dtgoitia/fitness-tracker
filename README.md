## Setup repo

```shell
make set-up-development-environment
```

## Environment variables

- `PUBLIC_GITHUB_REPOSITORY`: reference to the repository, including the user name `john-doe/my-app`
- `PUBLIC_GITHUB_ACCOUNT_TOKEN`: GitHub token `public_repo` scope.

## Common issues

- _My browser doesn't offer me the option to install the PWA_.
  Check you are accessing the website via HTTPS - instead of HTTP.

## Expose local PWA via ngrok for debugging

1. In one terminal, run:

```shell
make build-webapp-for-ngrok
```

2. In a separate terminal terminal, run:

```shell
make serve-webapp-ngrok
```

3. Navigate to https://sawfish-fitting-tadpole.ngrok-free.app/fitness-tracker/.
   Make sure to include the the trailing `/`.
