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
- Gemini-grounded coaching with validated structured output and a deterministic rule-based fallback
- Unseen-problem recommendations ranked from the cached Codeforces problem catalogue
- Saved report APIs and multi-report progress history
- Authenticated PDF export for saved reports
- Backend-connected profile, handle, practice, and notification preferences
- Coalesced Codeforces requests with snapshot, problemset, and stale-cache handling
- Shared frontend analytics snapshots with session and latest-saved-report fallback
- Functional dashboard controls and global hot-toast feedback for user actions
- Live weakness, rating, verdict, upsolving, recommendation, coach, plan, progress, and report pages

Gemini is optional and runs only through the authenticated backend. Its responses are grounded in a
compact verified analytics snapshot, schema-validated, rate-limited, and replaced by the
deterministic coach whenever the provider is missing, blocked, unavailable, or returns invalid data.

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

The backend currently has 28 tests covering API validation, Codeforces mapping and caching,
analytics, unseen recommendations, report/PDF payloads, progress history, the rule-based coach, and
the guarded Gemini provider.

See [the frontend-aligned implementation report](docs/CP-Performance-Analyzer-Aligned-Report.md)
for the architecture, data contracts, two-week roadmap, testing plan, and deployment checklist.
