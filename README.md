# PlantPulse – Web app

React + TypeScript (strict) + Tailwind CSS single-page app for PlantPulse. Take a photo of a plant and meet an
animated character whose mood follows the real care and health of the plant.

- Frontend repository: https://github.com/Jesusdavid2004/Plant_pulse_fronent
- Backend repository (API, Docker Compose for the whole stack): https://github.com/Jesusdavid2004/plant_pulse

## Features

- Sign up, log in, silent session restore (rotating refresh cookie) and protected routes.
- Add a plant from the **camera or a file**; the AI identifies it and checks its health.
- An SVG character drawn with the leaf shape, count, color and bloom (flower or spike) found by the AI, animated with `motion`; its mood
  (happy, worried, sad, sick) reacts to watering, light, fertilizing and to each health check-up.
- Health history and check-ups, plus a translated disclaimer wherever the AI gives advice.
- English and Spanish with locale-prefixed routes (`/en/...`, `/es/...`), `NEXT_LOCALE` cookie and a navbar switch.
- Light, dark and system themes with a manual override, no flash on load, WCAG AA contrast in both themes.
- Loading, empty and error states for every data-driven view; keyboard and screen-reader friendly.

## Structure

```text
src
├── lib                api-client.ts (the ONLY place that performs HTTP calls), config.ts
├── i18n               routing, locale layout, locale files (en.json / es.json)
├── theme              ThemeProvider and context (system / light / dark)
├── components         ui primitives (Button, Card, Dialog, ...) and layout (AppShell, switches)
├── features
│   ├── auth           AuthService, AuthProvider, forms, ProtectedRoute
│   ├── plants         PlantService, hooks, photo picker, add-plant dialog, check-ups, analysis cards
│   └── plant-pet      the character, mood rules, care actions, hooks
└── pages              thin pages that compose features
```

Rules followed: components render, hooks hold state, services talk to the API (never `fetch` in a component);
every API response is validated with zod and the TypeScript types are inferred from the schemas; no hardcoded
colors in components (CSS variable tokens) and no hardcoded user-facing strings (all go through i18n).

## Setup

Requirements: Node.js 22 and the API running (see the backend repository).

```bash
npm ci --legacy-peer-deps
cp .env.example .env     # VITE_API_URL, default http://localhost:3000/api
npm run dev              # http://localhost:5173
```

## Environment variables

| Variable       | Purpose                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the API. Defaults to `http://localhost:3000/api` in development and `/api` in Docker. |
| `BACKEND_URL`  | Docker/nginx only: the backend URL that nginx proxies `/api` to (`http://backend:3000`).          |
| `PORT`         | Docker/nginx only: port nginx listens on (set by Railway).                                        |

## Scripts

| Script                                     | What it does                                         |
| ------------------------------------------ | ---------------------------------------------------- |
| `npm run dev` / `build` / `preview`        | Vite development server, production build, preview   |
| `npm run typecheck`                        | `tsc -b` in strict mode                              |
| `npm run lint` / `format:check` / `format` | oxlint and Prettier                                  |
| `npm run i18n:check`                       | Fails if `en.json` and `es.json` have different keys |
| `npm test`                                 | Vitest + Testing Library component and unit tests    |
| `npm run test:e2e`                         | Playwright happy path (see below)                    |

## Tests

- **Component and unit tests** (`npm test`): API client (session refresh, schema validation), locale routing,
  theme provider, login and protected routes, add-plant flow, the character and its messages.
- **End-to-end** (`npm run test:e2e`): sign up, register a plant from a photo, water it, switch to Spanish and to
  dark theme, log out. It starts the Vite server and, if the backend repository is cloned next to this folder
  as `../backend`, the API with the fake AI. To run it against a stack that is already up, set
  `E2E_BASE_URL=http://localhost:5173`. Locally it uses the installed Microsoft Edge; in CI use Chromium.

GitHub Actions (`.github/workflows/ci.yml`) runs type-check, lint, formatting, `i18n:check`, tests and the build.

## Docker and deployment

`Dockerfile` builds the app and serves it with nginx, which also proxies `/api/` to `BACKEND_URL` so the browser
uses a single origin. Run the full stack (database, API, web app) from the backend repository with
`docker compose up --build`.

On Railway create a service from this repository and set `BACKEND_URL` to the backend's URL (no trailing slash).
Railway provides `PORT`. The generated domain of this service is the URL of the application.

## Resumen en español

Aplicación web (React + TypeScript estricto + Tailwind) de PlantPulse. Tomas una foto de tu planta con la cámara o
subiendo un archivo, la IA la identifica y revisa su salud, y aparece un personaje animado con las hojas propias
de esa planta cuyo ánimo cambia según el cuidado real (regar, luz, abono) y las revisiones de salud.

- Español e inglés con rutas `/es/...` y `/en/...`, tema claro, oscuro o del sistema, accesible y responsive.
- **Instalación**: `npm ci --legacy-peer-deps`, copiar `.env.example` a `.env` y `npm run dev`.
- **Pruebas**: `npm test` (componentes) y `npm run test:e2e` (flujo completo con Playwright).
- **Despliegue**: Docker + nginx; en Railway define `BACKEND_URL` con la URL del backend.
