# app-qg-front

Next.js application with Keycloak authentication and an SSE events stream page.

## Environment variables

Copy `.env.example` to `.env.local` for local development or to `.env` for Docker/Compose, then fill in:

- `KEYCLOAK_ISSUER` – Keycloak issuer URL for your realm (e.g. `https://sso.example.com/realms/my-realm`)
- `KEYCLOAK_CLIENT_ID` – Keycloak client ID for this frontend
- `KEYCLOAK_CLIENT_SECRET` – Client secret to exchange tokens
- `NEXTAUTH_SECRET` – Secret used by NextAuth/Auth.js
- `NEXTAUTH_URL` – Public URL of the frontend (used by Auth.js trusted host checks)
- `AUTH_TRUST_HOST` – Set to `true` if you want to bypass Auth.js host verification (prefer setting `NEXTAUTH_URL`)
- `API_URL` – Base URL for the API (embedded at build time for the frontend)

`lib/env.server.ts` centralizes these variables and fails fast when required server-side values are missing.

## Local development

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Docker

Build and run with Docker Compose (reads `.env` and passes `API_URL` at build time):

```bash
docker compose up --build
```

If you change `API_URL`, rebuild the image so the client bundle picks up the new value.

## Useful scripts

- `npm run dev` – start the Next.js dev server
- `npm run build` – production build
- `npm run start` – run the built app
- `npm run lint` – lint the codebase
