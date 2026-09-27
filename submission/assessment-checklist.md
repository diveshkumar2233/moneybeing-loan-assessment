# Assessment audit — 27 September 2026

Compared with the supplied **Python Full Stack Intern Assessment** DOCX, using the current repository rather than the earlier verification notes.

## Required modules

| Requirement | Evidence | Result |
|---|---|---|
| 1. Responsive application form | `frontend/components/LoanApplicationForm.tsx` contains full name, mobile, email, DOB, city, pincode, both loan types, both employment types, income, requested amount, property value and mandatory consent. `backend/app/schemas/lead.py` validates the same fields. Browser tests cover submission, required input and a 390px viewport; API tests cover invalid formats, dates, money and consent. | Implemented and checked |
| 2. Credit score integration | `services/credit_score.py` generates repeatable mock scores. The result component displays the score; the lead model persists it. A simulated provider timeout still saves the application with a null score and manual-review reason. Root README explicitly discloses the mock. | Implemented using the permitted mock option |
| 3. Configurable BRE | `database/default_rules.json` supplies all five assessment defaults to the `rules` table. `services/bre_engine.py` reads active database rules on each evaluation, including the percentage reference field. Tests verify immediate changes, inactive rules and the 80% boundary. Result UI displays status and rejection reasons. | Implemented and checked |
| 4. Admin login and dashboard | JWT login and admin dependencies protect management endpoints. Dashboard displays total, eligible, rejected and average credit score. Login, summary calculations and authorization are tested. | Implemented and checked |
| 5. Lead management | Table includes all seven required columns. Browser tests cover search and details. Separate API checks verified distinct pages and combined loan-type/status filters against restored PostgreSQL data. | Implemented and checked |
| 6. BRE management | Admin UI and API support create, edit and delete. Browser test changes a rule and submits subsequent leads to prove the new criteria take effect. Historical assessments remain stored. | Implemented and checked |
| 7. POST /api/leads | Service performs duplicate check, score lookup, dynamic evaluation and persistence. API test asserts the exact four-field success response. Reasons are exposed through response headers and lead details. | Implemented and checked |
| 8. Duplicate validation | Unique mobile constraint plus application check; API and browser tests assert HTTP 409 with `Lead already exists`. | Implemented and checked |

The implementation uses FastAPI, Next.js, TypeScript, Tailwind, SQLAlchemy, PostgreSQL and JWT. GitHub's main branch matched the local implementation commit before this audit.

## Required submission files

| Deliverable | Verification |
|---|---|
| GitHub repository | `https://github.com/diveshkumar2233/moneybeing-loan-assessment`; implementation and submission artifacts tracked in Git |
| SQL database dump | `database/demo_dump.sql` restored with `ON_ERROR_STOP=1` into a newly created audit database: 14 leads, 5 rules, 1 admin |
| Setup README | Root README includes prerequisites, backend/frontend installation, environment configuration, database initialization, sample local admin, architecture, mock disclosure and API examples |
| Postman collection | `postman/MoneyBeing.postman_collection.json` parses correctly and contains 16 requests with login token capture |
| 3–5 minute recording | `submission/walkthrough.webm`: browser measured 273.04 seconds, 1440×1200. Sampled frames show architecture captions, credit/BRE flow, lead management and rule management. It uses written explanations, without spoken narration. |

## Fresh verification

- **23 backend tests passed against PostgreSQL**, in a newly created disposable test database.
- **Production static build passed**, including TypeScript validation and all six application routes.
- **2 browser tests passed** against the production export served by FastAPI on port 8004 with a separate restored audit database. Coverage includes form submission, duplicate rejection, login, lead search/details, Excel download, rule CRUD and future evaluations, application deletion (cancel and confirm), logout, and mobile required-input/layout checks.
- SQL restore, pagination, combined filters and dashboard totals passed separate checks.
- No existing application database was used for test writes. Audit databases contain synthetic data only.

The browser suite accepts `PLAYWRIGHT_BASE_URL` and `PLAYWRIGHT_API_URL`, allowing tests to target an isolated instance rather than the default local application. Only run it against disposable data.

## Extras and limits

Excel export, dashboard chart code, Swagger/Postman, role checks, automated tests and Docker configuration are present. The full Docker Compose stack was **not reverified** in this audit; the earlier host-storage limitation is recorded in `verification.md`.

The live Render site's home page, health endpoint and Swagger returned HTTP 200. Its OpenAPI document did **not** include the newly added lead DELETE endpoint at the time of this audit. Local and GitHub code include it and deletion passed browser/API tests; the live service needs the latest deployment for that extra feature. This audit did not perform writes against the live service.

All eight mandatory assessment modules and five submission artifacts were found and checked. The above Docker and live-version limits should not be represented as verified successes.

## Live deployment update

The live URL is now https://moneybeing-loan-assessment-3.onrender.com/. Home, health, Swagger and OpenAPI endpoints returned HTTP 200; health reported `ok`. The new deployment exposes `DELETE /api/leads/{lead_id}` in OpenAPI, resolving the earlier missing-endpoint observation. No live customer records were modified during this check.
