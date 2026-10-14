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

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Implement the React and Vite frontend after the data and API contracts are working. Replace the pending implementation UI with real API data, including loading, empty, and error states. Ensure alerts and other UI elements are accessible.
- Logic tier decision: Implement the Express and TypeScript API routes for activities, teams, the leaderboard, and workout suggestions. Validate requests and return deliberate 4xx responses for invalid input, malformed IDs, and missing users.
- Data tier decision: Complete the Mongoose schemas and required validation rules for User, Team, Activity, and Workout. Update the seed script to create the required test fixtures idempotently, so repeated runs produce predictable data without unnecessary duplication.
- Activity tracking approach: Validate activity input and referenced user and team IDs, verify that the referenced records exist, and handle invalid IDs without allowing Mongoose cast errors to become 500 responses.
- Team management approach: Implement the team listing and creation contracts, enforce the required team name, and preserve the submitted name and mascot.
- Leaderboard approach: Calculate each team's total activity points, sort teams from highest to lowest total, and return the required team name, total points, and 1-based rank.
- Workout suggestions approach: Match the requested email to the correct user, use that user's goal and recent activity patterns to select relevant workouts, and provide a focus and reason for each suggestion. Return a deliberate 4xx response when the user is not found.

## Test plan

Record the commands you run and what each failure means.

Run the existing tests before implementation to establish the baseline. The initial results reported by Copilot were:

- Data contract: 4 failed, 1 passed.
- API contract: 4 failed.
- Frontend contract: 15 failed.

Record subsequent test results and the meaning of any failures.

- **Data-tier command:** `npm run test:data --prefix octofit-tracker/backend`
  - Baseline: 4 failed, 1 passed. Investigate missing schema validations and seed fixtures that are not idempotent.
- **API command:** `npm run test:api --prefix octofit-tracker/backend`
  - Baseline: 4 failed. Investigate activity validation and error handling, leaderboard ordering, and workout suggestions based on the correct user's activity patterns.
- **Frontend command:** `npm test --prefix octofit-tracker/frontend`
  - Baseline: 15 failed. Investigate the pending implementation UI, missing loading, empty, and error states, accessibility, and real API data rendering.
- **Backend build command:** `npm run build --prefix octofit-tracker/backend`
  - Verify that the backend compiles successfully after implementation. Investigate TypeScript errors, missing dependencies, and build configuration problems if it fails.
- **Frontend build command:** `npm run build --prefix octofit-tracker/frontend`
  - Verify that the frontend builds successfully after implementation. Investigate compilation errors, missing dependencies, and build configuration problems if it fails.

**Verification order:** Run the data-tier tests and fix failures first, then run the API tests, then the frontend tests. Run both build commands to verify compilation. Record the actual results after each implementation stage and rerun affected tests after fixes.