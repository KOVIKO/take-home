# Funnel Take Home project

This is the take home project from Funnel Leasing, brought to you by the dopest of engineers, Sean Smith aka KOVIKO. It is an API that investigates an external endpoint to check the altitude of a satellite every 10 seconds.

## Install

### Installation via Docker (preferred)

The preferred method by which to deploy this project would be to use [Docker](https://docs.docker.com/).

#### Providing environment variables for Docker

The environment variables are pulled from the files `.env` and `.env.database` in the root directory. Both of these files are necessary for Docker to successfully build the container. The variables required for these files can be found in `.env.example` and `.env.database.example`, respectively, in the root directory.

#### Installing the container with Docker

```bash
docker-compose up -d --build
```

#### Apps that will be included in the Docker container

There will be three apps in the container:

1. **db**: This app is the postgres database
1. **prisma-migrate**: This app generates the database schema and then exits
1. **take-home** : This app is the main application to view in the browser, exposed to port 3000

#### Uninstalling the container with Docker

```bash
docker-compose down
```

### Manual Installation

This method is not recommended if Docker can be used.

#### Providing a database

The app expects a Postgres database to exist and be accessible. The app also expects a `DATABASE_URL` environment variable, which will refer to that Postgres database's URL. The easiest way to provide this is to create a `.env` file in the root directory. An example of this file can be found at `.env.example` in the root directory.

#### Installing the app with NPM

```bash
npm i
```

#### Running the app with NPM

```bash
npm run start:prod
```

## View

The API and all of its endpoints can be browsed via the [Swagger](https://swagger.io/docs/) UI at <http://localhost:3000/>.

## Test

```bash
npm run test
```
