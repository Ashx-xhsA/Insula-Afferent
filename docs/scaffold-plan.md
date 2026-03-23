# Scaffold Plan — Insula Afferent

## Context
The repo exists with only docs and CLAUDE.md. We need to lay down the full monorepo skeleton before any Sprint 1 feature work can begin. This scaffold must match the decisions recorded in `docs/exploration-notes.md` exactly, so later PRs don't have to restructure anything.

---

## Step 1 — Root workspace

**Files to create:**
- `package.json` (root) — npm workspaces manifest + root scripts
- `.gitignore`
- `.env.example`
- `.eslintrc.js` (root, shared config)

**Root `package.json`:**
```json
{
  "name": "insula-afferent",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "dev:server": "npm run dev -w server",
    "dev:client": "npm run dev -w client",
    "test": "npm run test -w server && npm run test -w client",
    "lint": "npm run lint -w server && npm run lint -w client",
    "build": "npm run build -w client"
  },
  "devDependencies": {
    "concurrently": "^9.x",
    "eslint": "^9.x"
  }
}
```

**`.env.example`** env vars:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/insula
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`.gitignore`:** node_modules, .env, dist/, .DS_Store, coverage/

**`.eslintrc.js`:** extends `eslint:recommended`, env node+browser+es2022, `jsx` for client files.

---

## Step 2 — Backend scaffold (`server/`)

**Create `server/package.json`** with deps:
- runtime: `express`, `mongoose`, `passport`, `passport-google-oauth20`, `express-session`, `cors`, `dotenv`
- dev: `jest`, `supertest`, `mongodb-memory-server`, `nodemon`
- scripts: `"dev": "nodemon index.js"`, `"test": "jest"`, `"lint": "eslint ."`

**Create `server/jest.config.js`:**
```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',
};
```

**Create `server/tests/setup.js` and `teardown.js`** — start/stop `mongodb-memory-server`. MongoMemoryServer instance shared via global.

**Create `server/app.js`** — creates and exports the Express app (no `listen`):
- loads dotenv
- configures middleware (cors, session, passport, json body parser)
- mounts routes under `/api`
- exports `app`

**Create `server/index.js`** — entry point only:
- imports `app` from `./app`
- connects Mongoose
- calls `app.listen(process.env.PORT)`

This separation allows `supertest` to `import app from './app'` in tests without starting a live server.

### Models (`server/models/`)

Create Mongoose schemas (all files in camelCase):

- **`User.js`**: `googleId`, `email`, `displayName`, `avatar`, `createdAt`
- **`PhysicalStat.js`**: `userId` (ref User), `name`, `icon`, `currentValue` (0–100), `lastUpdatedAt`, `baseDecayRate` (units/hour), `isCustom`, `threshold`
- **`Event.js`**: `userId`, `name`, `icon`, `effects: [{ statName, delta }]`, `isPinned`, `isCustom`
- **`Buff.js`**: `userId`, `name`, `type` (environmental|user), `effects: [{ statName, coefficient }]`, `isActive`, `startDate`, `endDate`
- **`StatusSnapshot.js`**: `userId`, `snapshot: Map(statName → value)`, `mentalStats: { san, hp }`, `recordedAt`

### Routes (`server/routes/`) — all empty stubs returning `{ data: null, error: null }`

- `auth.js` — `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/me`, `POST /auth/logout`
- `stats.js` — `GET /stats`, `POST /stats/:id/restore`, `PATCH /stats/:id`
- `events.js` — `GET /events`, `POST /events/:id/trigger`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id`
- `buffs.js` — `GET /buffs`, `POST /buffs`, `PATCH /buffs/:id/toggle`, `DELETE /buffs/:id`

### Services (`server/services/`) — pure function stubs

- **`decayEngine.js`**: exports `computeCurrentValue(lastValue, decayRate, elapsedMs, buffCoefficient)` — stub returns `lastValue`
- **`decayEngine.test.js`**: placeholder test `should return lastValue when elapsed time is zero`
- **`buffEngine.js`**: exports `getEffectiveCoefficient(buffs, statName)` — stub returns `1`
- **`buffEngine.test.js`**: placeholder test
- **`mentalStatsEngine.js`**: exports `computeMentalStats(physicalStats, weights)` — stub returns `{ san: 100, hp: 100 }`
- **`mentalStatsEngine.test.js`**: placeholder test

### Config (`server/config/`)

- **`statDefaults.js`**: array of 6 default Physical Stats with `name`, `icon`, `baseDecayRate`, `threshold`
  ```js
  // baseDecayRate in points/hour so value hits 0 at natural decay cycle
  // Cleanliness: 100 / (3*24) ≈ 1.39/hr, Hunger: 100/6 ≈ 16.67/hr, etc.
  ```
- **`eventPresets.js`**: array of default Events with `name`, `icon`, `effects`
- **`constants.js`**: `STAT_MIN = 0`, `STAT_MAX = 100`, `DEFAULT_MENTAL_WEIGHTS`, cascade thresholds

### Middleware (`server/middleware/`)

- **`auth.js`**: stub `requireAuth` middleware that checks `req.isAuthenticated()`, returns `401` if not

---

## Step 3 — Frontend scaffold (`client/`)

Bootstrap with Vite React template then add Tailwind v4.

**`client/package.json`** — deps: `react`, `react-dom`, `react-router-dom`; devDeps: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`; scripts: `"dev": "vite"`, `"build": "vite build"`, `"lint": "eslint src"` (no test script — Sprint 1 has no frontend tests; Vitest added when needed)

**Vite + Tailwind v4 setup:**
- `client/vite.config.js`: imports `@tailwindcss/vite` plugin
- `client/src/index.css`: `@import "tailwindcss"` (v4 syntax — no `tailwind.config.js` needed)

**Folder structure inside `client/src/`:**
```
components/
  StatBar.jsx          # props: name, value (0-100) — renders progress bar
  EventButton.jsx      # props: event, onTrigger — button that fires an event
  MentalStatsPanel.jsx # props: san, hp — shows two derived stats
pages/
  Home.jsx             # placeholder: "Stats will appear here"
  Login.jsx            # placeholder: Google login button (non-functional)
hooks/                 # empty, placeholder
api/
  client.js            # base fetch wrapper: GET/POST to VITE_API_URL, returns { data, error }
  stats.js             # stub: getStats(), restoreStat()
  events.js            # stub: getEvents(), triggerEvent()
App.jsx                # react-router-dom BrowserRouter: / → Home, /login → Login
main.jsx               # ReactDOM.createRoot entry point
```

**`client/index.html`**: standard Vite HTML with `<div id="root">`

---

## Step 4 — CI/CD (`.github/workflows/`)

**`ci.yml`** — triggers on `pull_request` and `push` to `main`:
```yaml
jobs:
  test-server:   # npm ci in server/, npm run lint, npm test
  test-client:   # npm ci in client/, npm run lint
  # jobs run in parallel (no `needs` dependency between them)
```
- Node 22 LTS (`actions/setup-node@v4`)
- `actions/checkout@v4`
- Cache keyed on `server/package-lock.json` and `client/package-lock.json` respectively
- `working-directory` per step

**`deploy.yml`** — triggers on push to `main`, `needs: [test-server, test-client]`:
```yaml
jobs:
  deploy-server:
    steps:
      - run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
  # deploy-client: Vercel handles this automatically via GitHub integration
```

---

## Step 5 — Verification

After scaffold is created:

1. `npm install` from repo root — installs all workspaces, no errors
2. `npm run dev` — both Vite (`:5173`) and Express (`:5000`) start
3. `npm test` — all placeholder tests pass (3 server tests, 0 client tests)
4. `npm run lint` — no lint errors
5. `GET http://localhost:5000/api/stats` — returns `{ data: null, error: null }`
6. `GET http://localhost:5173` — Login page renders with Tailwind styles visible

---

## Critical Files

| File | Purpose |
|------|---------|
| `package.json` (root) | npm workspaces + orchestration scripts |
| `server/app.js` | Express app factory (exported for supertest) |
| `server/index.js` | DB connect + app.listen only |
| `server/models/*.js` | Mongoose schemas (5 models) |
| `server/services/decayEngine.js` | Core engine (pure fn stub) |
| `server/config/statDefaults.js` | Numerical values for 6 default stats |
| `server/config/constants.js` | All magic numbers centralized |
| `client/vite.config.js` | Vite + Tailwind v4 plugin |
| `client/src/api/client.js` | Base API fetch wrapper |
| `.github/workflows/ci.yml` | Parallel lint+test CI |
| `.github/workflows/deploy.yml` | Deploy on CI pass |
| `.env.example` | Documents all required env vars |
