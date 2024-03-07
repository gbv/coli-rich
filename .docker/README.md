# [coli-rich](https://github.com/gbv/coli-rich) (Docker)

This project is part of a larger infrastructure of [Project coli-conc](https://coli-conc.gbv.de). See [GitHub](https://github.com/gbv/coli-rich) for more information about the tool.

## Supported Architectures
Currently, only `x86-64` is supported.

## Available Tags
- The current release version is available under `latest`. The project is not yet stable, however. Once it is stable, we will offer SemVer versions and recommend to use version tags for deployment. <!-- However, new major versions might break compatibility of the previously used config file, therefore it is recommended to use a version tag instead. -->
<!-- - We follow SemVer for versioning the application. Therefore, `x` offers the latest image for the major version x, `x.y` offers the latest image for the minor version x.y, and `x.y.z` offers the image for a specific patch version x.y.z. -->
- Additionally, the latest development version is available under `dev`.

## Usage
It is recommended to run the image using [Docker Compose](https://docs.docker.com/compose/). Note that depending on your system, it might be necessary to use `sudo docker compose`. For older Docker versions, use `docker-compose` instead of `docker compose`.

1. Create `docker-compose.yml`:

```yml
version: "3"

services:
  coli-rich:
    image: ghcr.io/gbv/coli-rich
    # volumes:
    #   - ./config.json:/config/config.json
    ports:
      - 3077:3077
    restart: unless-stopped
```

2. Start the application:

```bash
docker compose up -d
```

This will create and start a coli-rich container running under host (and guest) port 3077. See [Configuration](#configuration) on how to configure it.

You can now access the application under `http://localhost:3077`.

## Application Setup
After changing `docker-compose.yml` (e.g. adjusting environment variables), it is necessary to recreate the container to apply changes: `docker compose up -d`. Changing the configuration file requires a restart: `docker compose restart`.

### Configuration
You can mount a config file into `/config/config.json` to configure coli-rich. Please refer to the [main documentation](../README.md#configuration) as well as to the [default configuration](../config/config.default.json) for more information and all available options.
