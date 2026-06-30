# CP Performance Analyzer

CP Performance Analyzer turns public Codeforces activity into explainable performance insights
and focused practice guidance.

## Current implementation

- React/Vite analytics frontend with protected application routes
- Express API foundation with security, validation, and consistent error responses
- MongoDB User and Report models
- Cookie-based JWT authentication and onboarding APIs
- Codeforces profile, submission, and rating-history adapter
- Stable submission normalization and unique-problem grouping
- Explainable topic weakness engine with unit tests
- Rating-band, verdict-pattern, and upsolving analyzers
- Rule-based recommendations and seven-day coaching plan (`aiEnabled: false`)
- Unseen-problem recommendations ranked from the cached Codeforces problem catalogue
- Saved report APIs and multi-report progress history
- Authenticated PDF export for saved reports
- Backend-connected profile, handle, practice, and notification preferences
- Coalesced Codeforces requests with snapshot, problemset, and stale-cache handling
- Shared frontend analytics snapshots with session and latest-saved-report fallback
- Live weakness, rating, verdict, upsolving, recommendation, coach, plan, progress, and report pages

External Gemini/OpenAI integration is intentionally disabled. The current coach is deterministic,
explainable, and generated only from verified analytics.

## Local setup

```bash
npm install
copy .env.example .env

cd server
npm install
copy .env.example .env
npm run dev
```

Run the frontend from a second terminal:

```bash
npm run dev
```

The API defaults to `http://localhost:5000`; the frontend defaults to
`http://localhost:5000/api`.

## Validation

```bash
npm run format:check
npm run build

cd server
npm test
```

The backend currently has 21 tests covering API validation, Codeforces mapping and caching,
analytics, unseen recommendations, report/PDF payloads, progress history, and the rule-based coach.

See [the frontend-aligned implementation report](docs/CP-Performance-Analyzer-Aligned-Report.md)
for the architecture, data contracts, two-week roadmap, testing plan, and deployment checklist.
