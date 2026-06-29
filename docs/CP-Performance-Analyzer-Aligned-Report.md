# CP Performance Analyzer + AI Upsolving Coach

## Frontend-Aligned Backend and Integration Report

**Prepared from the actual repository on:** June 29, 2026  
**Goal:** Convert the completed frontend prototype into a production-like, beginner-friendly full-stack MVP in approximately two weeks.

---

## 1. Project vision

CP Performance Analyzer is a competitive-programming analytics platform that transforms a Codeforces user's public activity into:

- performance summaries;
- topic-wise weakness analysis;
- rating-band analysis;
- verdict-pattern analysis;
- an upsolving queue;
- problem recommendations;
- progress tracking;
- AI-generated explanations and practice plans.

The core product principle is:

> Deterministic code calculates the analytics. AI explains the verified results and turns them into an actionable plan.

Raw submissions must not be treated as an AI prompt or as the final product. They are normalized, analyzed, cached, and summarized before AI is involved.

---

## 2. Verified frontend status

### Actual frontend stack

The repository currently uses:

- React with Vite;
- JavaScript and JSX;
- Tailwind CSS;
- a custom component library under `src/components/ui`;
- React Router;
- Recharts;
- Lucide React;
- `clsx` and `tailwind-merge`;
- mock data from `src/data/mockData.js`.

### Corrections to the original proposal

- The frontend does **not** currently use shadcn/ui. It uses locally implemented `Button`, `Card`, `Input`, `Select`, `Badge`, `Progress`, `Avatar`, `Label`, and `Switch` components.
- TypeScript is installed but the application is written in JavaScript/JSX.
- Axios is not installed or configured yet.
- There is no authentication state, protected routing, API client, server-state library, or persistent user state.
- AI Coach and Practice Plan have duplicate implementations in `ProductivityPages.jsx` and `InteractivePages.jsx`. The router uses the `InteractivePages.jsx` versions; the unused duplicates should be removed during integration.
- Most buttons currently demonstrate appearance rather than performing backend operations.

### Existing frontend routes

| Route               | Page                  | Current state                          |
| ------------------- | --------------------- | -------------------------------------- |
| `/`                 | Landing               | Complete presentation layer            |
| `/login`            | Login                 | UI only                                |
| `/register`         | Registration          | UI only                                |
| `/forgot-password`  | Password reset        | UI only; backend scope not yet defined |
| `/onboarding`       | Initial profile setup | UI only                                |
| `/dashboard`        | Dashboard             | Mock analytics                         |
| `/analyze`          | Handle analysis       | Simulated loading and success          |
| `/weakness`         | Weakness report       | Mock analytics                         |
| `/rating-analysis`  | Rating analysis       | Mock analytics                         |
| `/verdict-analysis` | Verdict analysis      | Mock analytics                         |
| `/upsolving`        | Upsolving queue       | Mock data and inactive actions         |
| `/ai-coach`         | AI chat               | Local canned replies                   |
| `/practice-plan`    | Weekly plan           | Interactive local state only           |
| `/recommendations`  | Recommendations       | Mock results and inactive filters      |
| `/progress`         | Progress              | Mock monthly history                   |
| `/profile`          | Profile               | Mock user                              |
| `/settings`         | Settings              | Local tab switching only               |
| `/report/:id`       | Report details        | Mock report                            |

The frontend is a strong prototype, but it should not be described as full-stack until real authentication, ingestion, analytics, persistence, and AI APIs are connected.

---

## 3. Target architecture

```text
React frontend
    |
    v
Express REST API
    |
    +-- Authentication and user preferences
    +-- Codeforces client and normalization
    +-- Deterministic analytics engine
    +-- MongoDB reports and cache
    +-- AI coach using compact analytics summaries
```

Use a modular monolith. Microservices, Redis, queues, event buses, and custom ML models are outside this MVP.

### Responsibility rules

- **Routes:** Define URL and middleware order.
- **Controllers:** Read HTTP input and return HTTP output.
- **Services:** Coordinate business workflows.
- **Codeforces client:** Call the external API only.
- **Mappers:** Convert Codeforces responses into stable internal objects.
- **Analyzers:** Pure functions that calculate statistics.
- **Models:** Define database persistence.
- **AI service:** Convert compact verified summaries into structured coaching content.

---

## 4. Aligned folder structure

```text
server/
  src/
    config/
      db.js
      env.js
    modules/
      auth/
        auth.controller.js
        auth.routes.js
        auth.service.js
        auth.validation.js
      user/
        user.model.js
        user.controller.js
        user.routes.js
        user.service.js
        user.validation.js
      codeforces/
        codeforces.client.js
        codeforces.mapper.js
        codeforces.controller.js
        codeforces.routes.js
        codeforces.service.js
      analytics/
        analytics.constants.js
        analytics.controller.js
        analytics.routes.js
        analytics.service.js
        analytics.validation.js
        weaknessEngine.js
        ratingAnalyzer.js
        verdictAnalyzer.js
        upsolvingAnalyzer.js
        progressAnalyzer.js
        recommendationEngine.js
      ai/
        ai.controller.js
        ai.routes.js
        ai.service.js
        ai.validation.js
      report/
        report.model.js
        report.controller.js
        report.routes.js
        report.service.js
        report.validation.js
    middleware/
      authMiddleware.js
      errorMiddleware.js
      notFoundMiddleware.js
      rateLimitMiddleware.js
      validateRequest.js
    utils/
      ApiError.js
      ApiResponse.js
      asyncHandler.js
      codeforcesHelpers.js
    app.js
    server.js
  tests/
    fixtures/
      codeforcesUser.json
      submissions.json
      ratingHistory.json
    integration/
      auth.test.js
      analytics.test.js
    unit/
      weaknessEngine.test.js
      ratingAnalyzer.test.js
      verdictAnalyzer.test.js
      upsolvingAnalyzer.test.js
  .env.example
  package.json
```

The original `auth.model.js` is removed because `User` should be the single source of identity and credentials. Separate auth and user models would duplicate account data.

---

## 5. Recommended dependencies

```bash
mkdir server
cd server
npm init -y
npm install express mongoose axios bcryptjs jsonwebtoken cors dotenv cookie-parser helmet express-rate-limit zod
npm install -D nodemon vitest supertest prettier
```

Use `bcryptjs` for a simpler cross-platform beginner setup. Use Zod for request and AI-output validation.

Suggested scripts:

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

---

## 6. Environment variables

Commit `.env.example`, but never commit `.env`.

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cp-performance-analyzer
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CODEFORCES_API_BASE_URL=https://codeforces.com/api
AI_PROVIDER=gemini
GEMINI_API_KEY=
OPENAI_API_KEY=
AI_MODEL=
```

Validate required variables in `env.js` when the server starts. Fail immediately with a useful message when configuration is invalid.

---

## 7. Database models aligned with the UI

### User

```js
{
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  codeforcesHandle: String,
  targetRating: Number,
  preferredPracticeMinutes: Number,
  difficultTopics: [String],
  preferences: {
    includeGymSubmissions: Boolean,
    weeklyReport: Boolean,
    streakReminders: Boolean,
    contestReminders: Boolean,
    detailedAIExplanations: Boolean,
    automaticRefresh: Boolean
  }
}
```

Do not treat current rating, maximum rating, contribution, or friend count as permanent user-owned fields. They come from Codeforces and become stale. Store them in report snapshots or a clearly timestamped Codeforces profile cache.

### Report

```js
{
  userId: ObjectId,
  handle: String,
  schemaVersion: Number,
  profile: Object,
  summary: Object,
  topicAnalysis: [Object],
  ratingAnalysis: [Object],
  verdictAnalysis: Object,
  upsolvingProblems: [Object],
  recommendations: [Object],
  progress: [Object],
  aiPlan: Object,
  source: {
    submissionCount: Number,
    latestSubmissionId: Number,
    fetchedAt: Date
  },
  generatedAt: Date
}
```

Indexes:

- `{ userId: 1, generatedAt: -1 }`
- `{ handle: 1, generatedAt: -1 }`
- optional TTL only for temporary cache records, not user-saved reports.

---

## 8. Codeforces ingestion rules

Use:

- `user.info` for profile data;
- `user.status` for submissions;
- `user.rating` for contest-rating history;
- `problemset.problems` for the global problem catalogue when recommendations need it.

Normalize each submission before analysis:

```js
{
  ;(submissionId,
    problemKey,
    contestId,
    index,
    name,
    rating,
    tags,
    verdict,
    language,
    createdAt,
    passedTestCount)
}
```

Primary problem identity is `${contestId}-${index}`. If Codeforces does not provide a contest ID, use a documented fallback identity rather than producing `undefined-A`.

### Calculation rules

- Attempted and solved counts use unique problems, not submission count.
- A problem is solved when at least one submission has verdict `OK`.
- An upsolving candidate has at least one submission and no `OK` submission.
- Sort submissions chronologically before calculating attempts before acceptance.
- Ignore submissions after the first acceptance when calculating attempts before AC.
- Exclude unrated problems from rating buckets, but keep them in overall and topic statistics.
- Tag comparisons should use normalized lowercase Codeforces tags.
- Preserve the last successful report when Codeforces is unavailable.

Do not expose the full problemset or raw Codeforces payload to the frontend.

---

## 9. Explainable weakness engine

Calculate each component from 0 to 100:

```text
conversionPenalty = 100 - acRate

retryPenalty =
min(failedSubmissions / max(attemptedProblems * 3, 1), 1) * 100

unsolvedPenalty =
unsolvedAttemptedProblems / max(attemptedProblems, 1) * 100

verdictPenalty = normalized weighted WA, TLE and runtime errors

recencyPenalty = normalized days since meaningful practice
```

Final score:

```text
weaknessScore =
conversionPenalty * 0.35
+ retryPenalty * 0.20
+ unsolvedPenalty * 0.25
+ verdictPenalty * 0.10
+ recencyPenalty * 0.10
```

Return the components as well as the score so the UI and AI can explain the result. Do not return only an unexplained number.

### Frontend-compatible topic DTO

```js
{
  topic: 'Dynamic Programming',
  short: 'DP',
  attempted: 42,
  solved: 19,
  failed: 73,
  rate: 45,
  weakness: 88,
  last: '2026-06-17T10:00:00.000Z',
  components: {
    conversionPenalty: 55,
    retryPenalty: 58,
    unsolvedPenalty: 55,
    verdictPenalty: 70,
    recencyPenalty: 40
  }
}
```

The frontend should format dates such as `12 days ago`; the backend should return ISO timestamps.

---

## 10. Rating, verdict, upsolving, and recommendation contracts

### Rating buckets

Use one consistent set across backend and frontend:

- 800–999
- 1000–1199
- 1200–1399
- 1400–1599
- 1600–1799
- 1800+

Frontend-compatible DTO:

```js
{
  bucket: '1200–1399',
  attempted: 91,
  solved: 57,
  failed: 64,
  rate: 63,
  avg: 2.3,
  weakTags: ['dp', 'graphs']
}
```

### Verdict chart DTO

```js
;[
  { name: 'Accepted', value: 218, color: '#22d3ee' },
  { name: 'Wrong Answer', value: 126, color: '#8b5cf6' },
]
```

Colors are presentation concerns and can remain in the frontend. The backend may instead return stable verdict keys and counts.

### Upsolving DTO

```js
{
  problemKey: '1342-C',
  name: 'Yet Another Counting Problem',
  contest: '1342C',
  contestId: 1342,
  index: 'C',
  rating: 1500,
  tags: ['math', 'number theory'],
  verdict: 'WRONG_ANSWER',
  attempts: 5,
  priority: 'High',
  url: 'https://codeforces.com/problemset/problem/1342/C'
}
```

Priority should be deterministic. Suggested inputs are repeated failures, current rating proximity, weak-topic overlap, recency, and whether the problem was attempted in a contest.

### Recommendations

Recommendations should initially use deterministic filtering and ranking from the Codeforces problemset. AI may explain _why_ a recommendation fits, but should not invent problem IDs.

---

## 11. API surface aligned with every existing page

### Authentication and onboarding

```text
POST  /api/auth/register
POST  /api/auth/login
POST  /api/auth/logout
GET   /api/auth/me
PATCH /api/user/profile
PATCH /api/user/codeforces-handle
PATCH /api/user/preferences
```

The existing forgot-password page has no matching backend scope. For the two-week MVP, either mark it unavailable or add a later email-token flow:

```text
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Do not present a fake “email sent” success state without implementing email delivery.

### Analysis and reports

```text
POST   /api/analytics/analyze/:handle
GET    /api/analytics/latest/:handle
GET    /api/analytics/summary/:handle
GET    /api/analytics/weakness/:handle
GET    /api/analytics/rating/:handle
GET    /api/analytics/verdicts/:handle
GET    /api/analytics/upsolving/:handle
GET    /api/analytics/recommendations/:handle
GET    /api/analytics/progress/:handle
GET    /api/reports
GET    /api/reports/:id
POST   /api/reports/:id/save
DELETE /api/reports/:id
```

Raw Codeforces proxy routes are useful for development and debugging but should not be the primary frontend contract. Dashboard pages should consume normalized report APIs.

### AI

```text
POST /api/ai/practice-plan
POST /api/ai/upsolving-plan
POST /api/ai/chat
```

### Page-to-API mapping

| Frontend page    | Primary API                                |
| ---------------- | ------------------------------------------ |
| Login            | `POST /api/auth/login`                     |
| Register         | `POST /api/auth/register`                  |
| Onboarding       | profile/handle update, then analyze        |
| Dashboard        | latest report summary                      |
| Analyze Handle   | create analysis                            |
| Weakness Report  | report topic analysis                      |
| Rating Analysis  | report rating analysis                     |
| Verdict Analysis | report verdict analysis                    |
| Upsolving        | report upsolving problems                  |
| AI Coach         | AI chat with current report context        |
| Practice Plan    | generate/load AI practice plan             |
| Recommendations  | deterministic recommendation endpoint      |
| Progress         | saved report history and rating history    |
| Profile          | user profile and latest Codeforces profile |
| Settings         | user preferences update                    |
| Report Details   | report by ID                               |

---

## 12. Standard API responses

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "generatedAt": "2026-06-29T10:00:00.000Z",
    "cached": false,
    "source": "codeforces"
  }
}
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "CODEFORCES_USER_NOT_FOUND",
    "message": "The Codeforces handle could not be found.",
    "details": null
  }
}
```

Use stable machine-readable error codes so the existing UI can show specific empty, invalid-handle, unavailable-service, and retry states.

---

## 13. AI coach contract

Do not send raw submissions. Send a compact summary:

```js
{
  ;(handle,
    currentRating,
    maxRating,
    targetRating,
    weakTopics,
    ratingGap,
    verdictPatterns,
    upsolvingSummary,
    recentPracticeTrend,
    preferredPracticeMinutes)
}
```

Require and validate structured AI output:

```js
{
  overview: String,
  priorityTopics: [String],
  sevenDayPlan: [
    {
      day: Number,
      topic: String,
      goal: String,
      problemCount: Number,
      ratingRange: String,
      note: String
    }
  ],
  upsolvingStrategy: [String],
  contestAdvice: [String]
}
```

If the AI provider fails, return a deterministic fallback plan generated from the top weaknesses and upsolving queue. Core analytics must remain usable without AI.

---

## 14. Frontend integration plan

Install Axios in the frontend:

```bash
npm install axios
```

Create:

```text
src/
  services/
    apiClient.js
    authApi.js
    analyticsApi.js
    aiApi.js
    reportApi.js
    userApi.js
  context/
    AuthContext.jsx
  hooks/
    useAuth.js
    useLatestReport.js
  components/
    ProtectedRoute.jsx
```

Recommended production-like authentication uses a JWT in an HTTP-only cookie. In that approach, Axios uses `withCredentials: true`; JavaScript does not read or attach the token. Add a response interceptor for consistent `401`, network, and server-error handling.

Replace `mockData.js` incrementally:

1. Connect registration and login.
2. Add authenticated user state and protected dashboard routes.
3. Connect Analyze Handle and save the returned report ID.
4. Make Dashboard and all analytics pages read the same report snapshot.
5. Connect profile and settings.
6. Connect recommendations and progress.
7. Connect AI Coach and Practice Plan last.

Keep mock data available only as explicit development fixtures, not as silent production fallback data.

---

## 15. Two-week execution plan

### Days 1–2: Foundation

- Create Express server and environment validation.
- Connect MongoDB.
- Add shared error handling, security middleware, CORS, and health endpoint.
- Create User and Report models.

### Days 3–4: Authentication and onboarding

- Register, login, logout, and current-user APIs.
- Add password hashing and JWT cookie authentication.
- Add profile, handle, and preference updates.
- Connect login, registration, and onboarding pages.

### Day 5: Codeforces adapter

- Implement client timeouts and error mapping.
- Fetch user, submissions, and rating history.
- Normalize responses.
- Save fixture responses for repeatable testing.

### Days 6–8: Analytics engine

- Implement unique problem grouping.
- Implement topic, rating, verdict, upsolving, progress, and recommendation analyzers.
- Add unit tests using fixtures.
- Return one complete report from Analyze Handle.

### Day 9: Persistence and caching

- Save report snapshots.
- Return latest and historical reports.
- Avoid regenerating when the newest Codeforces submission has not changed.

### Days 10–11: Frontend analytics integration

- Replace dashboard mock data.
- Connect weakness, rating, verdict, upsolving, recommendations, progress, and report pages.
- Add loading, empty, stale-cache, and error states.

### Day 12: AI coach

- Build compact AI context.
- Validate structured output.
- Add fallback plan.
- Connect AI Coach and Practice Plan.

### Day 13: Integration and security testing

- Test authentication and protected routes.
- Test invalid handles, private/missing data, Codeforces failure, AI failure, and database failure.
- Add rate limits and payload limits.

### Day 14: Deployment and presentation

- Deploy MongoDB, backend, and frontend.
- Configure CORS, cookies, environment variables, and SPA route fallback.
- Update README with architecture, setup, API examples, screenshots, limitations, and future work.

---

## 16. Testing checklist

### Analytics unit tests

- Multiple submissions for the same problem count as one attempted problem.
- A later `OK` converts an attempted problem into solved.
- Attempts before AC ignore submissions after the first AC.
- Unrated problems do not enter rating buckets.
- Tag counts are based on unique problems.
- Empty submissions return zeroed, valid analytics.
- Unknown verdicts do not crash analysis.
- Weakness scores stay between 0 and 100.

### API integration tests

- Duplicate email registration is rejected.
- Wrong password does not reveal whether an account exists.
- Protected endpoints reject unauthenticated requests.
- Invalid handles produce a stable error code.
- Codeforces timeouts return a controlled error or cached report.
- Users cannot delete another user's saved report.
- AI output that fails validation uses the fallback path.

### Frontend tests

- Refreshing a protected route restores the session.
- Every analytics page reads the selected report.
- Analyze Handle shows loading, success, invalid-handle, and retry states.
- Logout clears the session.
- Mobile navigation and tables remain usable with real data.

---

## 17. Deployment checklist

- MongoDB Atlas database and least-privilege database user.
- Backend deployed with secrets stored in platform environment variables.
- Frontend configured with `VITE_API_BASE_URL`.
- Explicit production CORS origin.
- Secure cookie configuration verified over HTTPS.
- Express trust-proxy configuration set for the hosting platform.
- API health endpoint available.
- Request and external API timeouts enabled.
- No secrets or raw authentication tokens in logs.
- Vite host configured with SPA fallback for direct route visits.
- Codeforces and AI failures tested in production-like conditions.
- README accurately distinguishes implemented features from planned features.

---

## 18. MVP definition of done

The MVP is complete when a user can:

1. register, log in, and log out;
2. save a Codeforces handle and practice preferences;
3. generate a real analysis from public Codeforces data;
4. understand the components behind a weakness score;
5. inspect rating and verdict patterns;
6. see unsolved attempted problems and valid Codeforces links;
7. receive deterministic recommendations;
8. receive an AI-assisted seven-day practice plan;
9. return later and load saved reports;
10. receive useful errors when MongoDB, Codeforces, or the AI provider is unavailable.

## Final project narrative

The strongest accurate description is:

> CP Performance Analyzer is a modular full-stack analytics application that normalizes public Codeforces data, applies a deterministic and explainable weakness engine, stores versioned report snapshots, and uses an LLM only to translate verified performance signals into personalized practice guidance.

This framing is technically credible, interview-explainable, and aligned with the frontend that already exists.
