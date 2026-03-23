# Insula Afferent — Technical Exploration Notes

> Research conducted before scaffolding. Each section documents the decision space,
> tradeoffs considered, and the final recommendation for this project.

---

## 1. Monorepo Structure

### Layout

```
insula-afferent/
  client/          # React + Vite + Tailwind (own package.json)
  server/          # Express + MongoDB (own package.json)
  package.json     # Root — npm workspaces manifest
  .env
  CLAUDE.md
```

`client/` and `server/` never import from each other directly — all communication goes through the API boundary. The frontend gets config data (stat defaults, event presets, constants) through API responses, not direct imports.

### Dependency Management: npm Workspaces

Use **npm workspaces** (npm v7+, Node 22). The root `package.json`:

```json
{
  "workspaces": ["client", "server"]
}
```

A single `npm install` at the root hoists shared dev tools (`eslint`, `jest`, `concurrently`) into root `node_modules`. Package-specific deps (`express`, `react`) stay in their respective workspace `node_modules`.

Root scripts orchestrate both processes:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "test": "npm run test -w server && npm run test -w client",
    "lint": "npm run lint -w server && npm run lint -w client"
  }
}
```

### No `shared/` Package

A three-workspace setup adds unnecessary complexity for a course project. Stat defaults, event presets, and constants live in `server/config/` and are served to the frontend via API responses. This keeps the dependency graph flat: client talks to server, server owns all config.

### npm Workspaces vs. Flat Single `package.json`

| | npm Workspaces | Flat `package.json` |
|---|---|---|
| Dependency isolation | Each package scoped | All deps co-mingled |
| Independent deployment | Deploy `server/` alone | All deps always bundled |
| Script clarity | `npm run dev -w server` | Must `cd` manually |
| Complexity | Minor initial setup | Dead simple |
| Scaling | Grows cleanly | Tangles beyond 2 packages |

**Recommendation: npm workspaces** with `client/` and `server/` only.

---

## 2. React Setup: Vite vs CRA

**CRA is abandoned.** Meta stopped maintaining it in late 2022; the React docs removed it in 2023. It ships Webpack 5 with no ongoing patches. Do not use it.

**Vite wins on every axis:**

| | Vite | CRA |
|---|---|---|
| Cold start | <300ms (native ESM) | Seconds (full bundle) |
| HMR | Near-instant, module-level | Degrades with project size |
| Production build | Rollup, better tree-shaking | Webpack 5 |
| Tailwind v4 | First-class `@tailwindcss/vite` plugin | Requires ejecting or craco hacks |
| Ecosystem | De facto standard for SPAs | Effectively dead |

**Tailwind v4 specifics:** The `@tailwindcss/vite` plugin integrates with a single line in `vite.config.js` — no PostCSS config required. CRA's locked-down Webpack config cannot use this without unsupported workarounds.

**Recommendation: Vite.** Bootstrap with `npm create vite@latest client -- --template react`, then `npm install @tailwindcss/vite`.

---

## 3. MongoDB: Mongoose vs Native Driver

### For This Project's Data Model

| Collection | Shape | Verdict |
|---|---|---|
| Users, auth | Fixed schema | Mongoose ideal |
| Physical Stats config | Structured, per-user | Mongoose ideal |
| Event & Buff definitions | Structured with optional custom fields | Mongoose with `Mixed` or discriminators |
| Status history snapshots | High-write, time-series-like | Native driver via `mongoose.connection.db` |
| Community content | Polymorphic (Buffs/Events/Templates) | Mongoose discriminators |

### Mongoose Benefits for This Project

- **Pre/post hooks**: auto-compute Mental Stats before saving a snapshot; strip unknown fields from community imports before persisting
- **Validators**: enforce decay rates > 0, stat values 0–100, required fields on Event definitions
- **Lean queries**: `.lean()` for read-heavy endpoints (stat display) avoids Document object overhead
- **Discriminators**: model community Buffs, Events, and Templates as variants of a shared base schema

### When to Drop to Native Driver

The status history snapshot collection (written by the cron job every N minutes per user) is the one high-write path where Mongoose hydration overhead accumulates. For bulk snapshot inserts, bypass Mongoose via `mongoose.connection.db.collection('snapshots').insertMany(...)`.

**Recommendation: Mongoose** as the primary ORM. Use `mongoose.connection.db` for bulk snapshot writes only.

---

## 4. Decay Calculation Strategy

### Sprint 1: On-Demand Calculation (No Cron)

Sprint 1 uses on-demand decay rather than a background job. When a user opens the app or triggers an Event, the backend computes current stat values in real time:

```
currentValue = lastValue - decayRate × elapsedTime × buffCoefficients
```

This is a pure math operation. No scheduler, no persistent process.

### Why On-Demand Works for Linear Decay

Linear decay produces identical results whether computed continuously or at the moment of request — the math is the same either way. There is no approximation or data loss from not running a background process. The `decayEngine` remains a stateless pure function, which is easier to unit test (no mocking of schedulers or timing) and has no infrastructure dependencies.

### Why Not a Cron Job in Sprint 1

- **Agenda** (MongoDB-backed) or **node-cron** would require a persistent always-on process. On Render's free tier, the server sleeps after inactivity — cron ticks are missed, which would silently corrupt the core mechanic.
- **Agenda** adds a dependency and job management complexity that Sprint 1 doesn't need.
- **YAGNI**: the Sprint 1 deliverable is decay + events + mental stats display. On-demand calculation fully satisfies that without a scheduler.

### When Cron Becomes Necessary (Sprint 3)

Three Sprint 3 features require a background process:

1. **Threshold alerts** — need polling to detect when a stat drops below a threshold and trigger a push notification. An on-demand model only fires on user action, which may be too late.
2. **Cascading effects** — non-linear, threshold-triggered decay modifiers may require segmented computation that is awkward to do purely on-demand.
3. **Historical snapshots** — daily status recordings need to be written periodically, independent of user activity.

By Sprint 3 the project may have a dedicated server (not Render free tier), removing the sleep constraint. At that point, **Agenda** is the recommended choice — it uses the existing MongoDB connection for persistence and handles missed ticks on restart, with no Redis dependency.

### Comparison for Future Reference

| | node-cron | Agenda | Bull / BullMQ |
|---|---|---|---|
| Persistence across restarts | None — missed jobs lost | Yes — MongoDB-backed | Yes — Redis-backed |
| Infrastructure needed | None | MongoDB (already in stack) | Redis (new dependency) |
| Per-user job scheduling | Awkward | Native via job data | Native |
| Complexity | Minimal | Moderate | High |
| When relevant | Never for this project | Sprint 3+ | If scale demands it |

**Sprint 1 decision: no cron library.** Decay is computed on-demand in `decayEngine.js` as a pure function.

---

## 5. Project Directory Structure

Full structure fitting the three-engine architecture (decay, buff, mental stats) and CLAUDE.md conventions:

```
insula-afferent/
│
├── client/                          # React SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/              # PascalCase React components
│       │   ├── StatBar.jsx
│       │   ├── EventButton.jsx
│       │   └── MentalStatsPanel.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   └── Trends.jsx
│       ├── hooks/
│       ├── api/                     # Fetch wrappers for backend routes
│       └── App.jsx
│
├── server/                          # Express API
│   ├── package.json
│   ├── index.js                     # Entry point — mounts routes, connects DB
│   ├── models/                      # Mongoose models
│   │   ├── User.js
│   │   ├── PhysicalStat.js
│   │   ├── StatusSnapshot.js
│   │   ├── Event.js
│   │   └── Buff.js
│   ├── routes/                      # Express route handlers (thin — delegate to services)
│   │   ├── auth.js
│   │   ├── stats.js
│   │   ├── events.js
│   │   └── buffs.js
│   ├── services/                    # Business logic layer
│   │   ├── decayEngine.js           # Pure function: lastValue × elapsedTime × coefficients
│   │   ├── decayEngine.test.js
│   │   ├── buffEngine.js            # Aggregates env + user buffs → coefficients
│   │   ├── buffEngine.test.js
│   │   ├── mentalStatsEngine.js     # Weighted formula → SAN + HP
│   │   ├── mentalStatsEngine.test.js
│   │   ├── environmentService.js    # Fetches Open-Meteo, OpenAQ, Sunrise-Sunset
│   │   └── environmentService.test.js
│   ├── config/                      # Non-secret app config (served via API)
│   │   ├── statDefaults.js          # Default Physical Stats (names, base decay rates)
│   │   ├── eventPresets.js          # Default Events and their stat effects
│   │   └── constants.js             # Threshold values, formula weights
│   └── middleware/
│       └── auth.js                  # Google OAuth middleware
│
├── package.json                     # npm workspaces root
├── .env                             # Never committed
├── .env.example
├── .eslintrc.js
├── jest.config.js
└── CLAUDE.md
```

**Engine separation rationale:**
- `decayEngine.js` — pure function: takes current stat values + elapsed time + buff coefficients → returns new stat values. Stateless, no scheduler dependency, easily unit-tested.
- `buffEngine.js` — aggregates all active Buffs (environmental + user-toggled) → returns a coefficient map per stat.
- `mentalStatsEngine.js` — takes Physical Stat values + user formula weights → returns SAN and HP scores.
- `config/` — all numerical values and presets live here, never hardcoded in service logic (per CLAUDE.md). Frontend receives this data through API responses.

---

## 6. Deployment

### Requirements

- React SPA (static)
- Express API — request-driven (no background cron process in Sprint 1)
- MongoDB — Atlas M0 free tier
- Free tier for course use; will migrate to self-hosted server later

### Platform Comparison

| | Vercel | Railway | Render | Fly.io |
|---|---|---|---|---|
| Free tier | Hobby: generous for static/serverless | ~$5/mo credit | Yes — free web service | 160 GB-hrs/mo compute |
| Long-running Express | Not natively — serverless only | Yes, persistent process | Yes, persistent process | Yes, always-on within allowance |
| In-process cron (Sprint 3) | Won't work — process not persistent | Works | Works on paid; free tier sleeps | Works |
| Free tier sleep behavior | N/A (serverless) | No sleep | Sleeps after 15 min inactivity | No sleep within allowance |
| MongoDB | Atlas only | Atlas or self-hosted | Atlas only | Atlas or self-hosted on Fly |
| Setup complexity | Easiest for frontend | Easy — `railway up` | Easy — GitHub auto-deploy | Moderate — `flyctl` + Dockerfile |
| Cold starts | Yes (serverless) | No | Free tier: 30s+ on wake | No |

### Why Render Works for Sprint 1

Sprint 1 uses on-demand decay — no background cron process. Render's free tier sleep behavior (server sleeps after 15 minutes of inactivity) is only a problem when a process must fire on a schedule. For a request-driven Express API, a cold start on first request is acceptable. This constraint will be revisited in Sprint 3 when background jobs become necessary.

### Recommendation

**Split deployment (course/free tier):**
- **Vercel** for `client/` — zero-config GitHub integration, instant deploys, CDN, preview URLs per PR.
- **Render** for `server/` — free persistent process, GitHub auto-deploy via deploy hook, simple dashboard. No cron dependency in Sprint 1 means the sleep limitation does not affect correctness.
- **MongoDB Atlas M0** — free tier, cloud-hosted, connects to Render backend via `MONGODB_URI` env var.

Plan to migrate backend to a self-hosted server by Sprint 3 when threshold alert polling and snapshot recording require an always-on background process.

---

## 7. CI/CD: GitHub Actions

### Two Workflow Files

**`.github/workflows/ci.yml`** — triggers on every PR and push to `main`

```
on: [pull_request, push to main]

jobs:
  test-server:               # and lint-server
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node (Node 22 LTS)
      - cache: npm, key on server/package-lock.json
      - npm ci (working-directory: ./server)
      - npm run lint
      - npm test

  test-client:               # and lint-client (runs in parallel with test-server)
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node (Node 22 LTS)
      - cache: npm, key on client/package-lock.json
      - npm ci (working-directory: ./client)
      - npm run lint
      - npm test
```

**`.github/workflows/deploy.yml`** — triggers on push to `main`, gated on CI passing

```
on: push to main
needs: [test-server, test-client]

jobs:
  deploy-client:
    # Vercel: handled automatically via Vercel GitHub integration — no YAML needed

  deploy-server:
    steps:
      - checkout
      - curl $RENDER_DEPLOY_HOOK_URL     # or: railway up via @railway/cli
```

### Key Decisions

- **Node 22 LTS** — Node 18 EOL April 2025, Node 20 EOL April 2026. Pin explicitly.
- **`actions/checkout@v4`, `actions/setup-node@v4`** — v3 is deprecated.
- **`npm ci` not `npm install`** — respects `package-lock.json` exactly, faster in clean environments.
- **`working-directory`** per step instead of `cd server &&` in run commands — cleaner and avoids shell quoting issues.
- **Parallel jobs** — `test-server` and `test-client` run concurrently, halving total CI time.
- **MongoDB in tests** — use `mongodb-memory-server` for all tests. No Atlas connection needed in CI, no secrets to manage, fully isolated.
- **Render deploy hook** — a single `curl` to a secret URL. Simpler than Railway CLI installation in CI.

### Secrets to Configure in GitHub Repo Settings

| Secret | Used by |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | deploy.yml — triggers Render redeploy |
| `RAILWAY_TOKEN` | deploy.yml (if Railway CLI used instead) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional: only if OAuth tested in CI |

---

## Summary of Decisions

| Decision | Choice | Key Reason |
|---|---|---|
| Monorepo structure | npm workspaces: `client/`, `server/` only | Two workspaces sufficient; config lives in `server/config/` |
| React bundler | Vite | CRA abandoned; native Tailwind v4 plugin |
| MongoDB abstraction | Mongoose (native driver for bulk snapshot writes) | Schema validation + middleware hooks; raw driver for high-write path |
| Decay strategy (Sprint 1) | On-demand calculation, no cron | Linear decay = same result on-demand; pure function, easier TDD, no scheduler dependency |
| Cron/job scheduler (Sprint 3) | Agenda | MongoDB-backed persistence, no Redis; needed for alerts + snapshots |
| Deployment | Vercel (frontend) + Render free tier (backend) + Atlas M0 | No cron in Sprint 1 → Render free tier acceptable; migrate to self-hosted in Sprint 3 |
| CI/CD | GitHub Actions, two workflow files | Parallel lint+test jobs, deploy gated on CI |
