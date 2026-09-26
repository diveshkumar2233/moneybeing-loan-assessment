# 3–5 minute explanation outline

1. **Architecture (0:00–0:25):** Next.js, TypeScript and Tailwind render the customer/admin UI. FastAPI validates requests with Pydantic. SQLAlchemy persists users, leads and business rules in PostgreSQL. JWT and administrator authorization protect management APIs.
2. **Application (0:25–1:05):** Enter customer and loan details, grant consent, and submit. Explain client/server validation, mock credit scoring, dynamic BRE evaluation, persistence, status and rejection reasons.
3. **Duplicate protection (1:05–1:25):** Resubmit the same mobile. Show `Lead already exists`. A database unique constraint also protects concurrent submissions.
4. **Admin dashboard (1:25–1:50):** Sign in and show total, eligible and rejected lead counts, average score, and eligibility chart.
5. **Lead management (1:50–2:20):** Search by name/mobile, filter status or loan type, page through results, inspect a lead and export Excel.
6. **Business rules (2:20–3:15):** Show all five default rules. Add an income rule, save it and submit a new application to demonstrate the new rejection reason without restarting the backend. Edit and delete the temporary rule. Explain that existing decisions and evaluated-rule snapshots are retained.
7. **API and handoff (3:15–3:40):** Show Swagger. Explain the exact four-field response, mock service failure behavior, tests, Postman, SQL dump and README. Clearly distinguish the mock score from a bureau-provided score.

The provided silent recording uses on-screen captions. You can use this outline to record a personal voice explanation if desired.
