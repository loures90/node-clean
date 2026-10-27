# Signup API

Authentication API built with Node.js, TypeScript, Express, and MongoDB.

## Run locally with Docker

Requirements: Docker and Docker Compose.

1. Create a `.env` file in the project root:

   ```env
   SEED_USER_EMAIL=user@example.com
   SEED_USER_PASSWORD=local-password
   JWT_SECRET=replace-with-a-long-secret
   ```

   `SEED_USER_NAME` is optional (default: `User Name`). `PORT` is also optional
   (default: `3000`). Do not share or commit your `.env` file.

2. From the project root, build the images and start the services:

   ```bash
   docker compose up --build
   ```

   Compose starts MongoDB, waits for the database to become available, creates
   the initial user, and then starts the API. Use the seeded account to
   authenticate.

3. Open:

   - API: `http://localhost:3000`
   - Swagger UI: `http://localhost:3000/api-docs`
   - OpenAPI specification in JSON: `http://localhost:3000/api-docs.json`

To stop the services, press `Ctrl+C` and run `docker compose down`. MongoDB data
is stored in a Docker volume and is preserved when the services stop.

## Architecture

The project organizes responsibilities into layers:

- **Domain** defines core contracts and models, such as authorization and
  accounts.
- **Data** implements use cases and defines protocols for dependencies.
- **Infra** provides technical implementations, such as MongoDB access, password
  hashing, and token generation.
- **Presentation** contains the login controller and HTTP protocols.
- **Application** wires concrete dependencies and controllers.
- **Main** configures Express, routes, Swagger documentation, and application
  startup.

The code aims to follow the Clean Architecture model. It is based on Rodrigo Manguinho and Rodrigo Branas classes.

## AI-assisted development

GitHub Copilot was used as an AI coding assistant to speed up development. It
helped explore implementation approaches, refine code and tests, and draft
documentation. Its suggestions were reviewed and adapted during development. 
Gemini was also used in this process.
