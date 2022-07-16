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

## Using HTTPS locally

These steps worked: https://www.freecodecamp.org/news/how-to-set-up-https-locally-with-create-react-app/

<!-- https://github.com/FiloSottile/mkcert -->

```shell
aurman -S mkcert
cd webapp

# Setup mkcert on your machine (creates a CA)
mkcert -install

# Create .cert directory if it doesn't exist
mkdir -p .cert

# Generate the certificate (ran from the root of this project)
mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "localhost"
```

Update `package.json`:

```json
"scripts": {
  "start": "HTTPS=true SSL_CRT_FILE=./.cert/cert.pem SSL_KEY_FILE=./.cert/key.pem react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
},
```
