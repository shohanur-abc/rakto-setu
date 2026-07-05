# RaktoSetu Bruno V4 YAML Collection

This collection uses Bruno OpenCollection YAML format:
- `opencollection.yml` at the collection root
- `environments/env.yml` for the Local environment
- request files stored as `.yml` under folders

Open this folder in Bruno and select the `Local` environment.

Base URL: `http://localhost:3000/api/v1`

Login flow:
1. Run `Auth / Authenticate and receive a JWT`.
2. The after-response script stores the JWT as runtime variable `token` using `bru.setVar("token", token)`.
3. Run protected requests.

Do not commit real passwords or JWTs. Bruno V4 persists environment variable changes to disk if scripts use `bru.setEnvVar()`, so this collection uses `bru.setVar()` for JWT.
