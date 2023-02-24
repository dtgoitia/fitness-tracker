To develop inside the container:

- Initial setup:

  1. Install _Dev Containers_ extension (`ms-vscode-remote.remote-containers`).
  2. Spin up container: `make shell-api`.
  3. In VSCode command palette: `Dev Containers: Attach to Running Container...`
  4. Select running container - will open a new window.
  5. Go to file explorer, and open the path set in `WORKDIR` (see Dockerfile).
  6. Install the _Python_ extension (`ms-python.python`) inside the container - you can add others you might want.
  7. In command palette: `Python: Select Interpreter`, and select docker interpreter.

- Usage:

  1. Spin up container: `make shell-api`.
  2. In VSCode command palette: `Dev Containers: Attach to Running Container...`
  3. Select running container - will open a new window.
  4. In command palette: `Python: Select Interpreter`, and select docker interpreter.
