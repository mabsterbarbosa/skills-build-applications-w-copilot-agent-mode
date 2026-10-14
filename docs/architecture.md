# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision:
  - Wire the React pages to fetch real data
  - Implement loading, empty, and failure states
  - Ensure the UI matches the expected accessible behavior

- Logic tier decision:
  - Build /api/activities, /api/teams, /api/leaderboard, and /api/workouts/suggestions/:userEmail
  - Ensure invalid IDs and missing users return deliberate 4xx responses instead of casts/500s

- Data tier decision:
  - Implement the Mongoose schemas and required validation rules
  - Make the seed script idempotent and create the required test fixtures

- Activity tracking approach:
- Team management approach:
- Leaderboard approach:
- Workout suggestions approach:

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Required schema validations are missing for User, Team, Activity, and Workout
  - The seed logic is not yet producing the required idempotent fixtures

- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Activity validation and 4xx handling are incomplete
  - Leaderboard sorting does not match the expected ordering
  - Workout suggestions are not matched by the correct user activity pattern

- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - The UI still renders “Implementation pending”
  - Loading, empty, and error states are not implemented
  - Accessible alerts and real data rendering are missing

- Backend build command: `npm run build --prefix octofit-tracker/backend`

- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
