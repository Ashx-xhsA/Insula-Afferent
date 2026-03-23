# CLAUDE.md

## References
@docs/prd.md
@docs/api-spec.md
@docs/numerical-design.md

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express (RESTful API) |
| Database | MongoDB |
| External APIs | Open-Meteo, Sunrise-Sunset API, OpenAQ/AirNow |
| Auth | Google OAuth |

## Coding Conventions
- API routes return `{ data, error }` shape consistently
- All backend files use camelCase, React components use PascalCase
- MongoDB models live in `server/models/`, routes in `server/routes/`
- Environment variables go in `.env`, never hardcode secrets
- Use async/await, not callbacks or raw promises

## Testing Strategy
- Framework: Jest
- Test files live next to source: `decayEngine.js` → `decayEngine.test.js`
- Test naming: `test('should [expected behavior] when [condition]')`
- Run all tests before committing

## Do's and Don'ts

### Do
- Write tests before implementation (TDD)
- Use the decay engine for all stat modifications over time
- Keep numerical values in config, not hardcoded in logic
- Run `npm run lint` before committing

### Don't
- Don't modify `.env` or any secrets files
- Don't skip writing tests for new API routes
- Don't put business logic in route handlers — use service layer
- Don't modify the database schema without a migration plan


## Commands

```bash
# Install dependencies (run from repo root)
npm install

# Start development servers
npm run dev          # starts both frontend and backend (via concurrently)
npm run dev:server   # backend only
npm run dev:client   # frontend only

# Run tests
npm test             # all tests
npm test -- --testPathPattern=<file>  # single test file

# Lint
npm run lint

# Build
npm run build
```

## Architecture Overview
Data model uses States + Forces pattern — see @prd.md for details.
- States: Physical Stats (6 default) + Mental Stats (derived)
- Forces: Time Decay, Events, Buffs, Cascading Effects — all act on Physical Stats independently
