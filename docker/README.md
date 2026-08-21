# Container design

The root `Dockerfile` is the single authoritative application image definition. It uses a build stage for TypeScript and a non-root runtime stage. `docker-compose.yml` adds the local SQLite volume and health check without duplicating the image recipe.
