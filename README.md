# MoneyBeing Loan Eligibility & Lead Management Module

Full-stack assessment for MoneyBeing Private Limited. Includes a responsive loan application, mock credit scoring, database-driven business rules, JWT admin access, searchable/paginated leads, rule management, Excel export, dashboard charts, OpenAPI documentation, Postman collection, Docker configuration, and automated tests.

## Watch the project walkthrough

**Netlify frontend:** [Deploy on Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/diveshkumar2233/moneybeing-loan-assessment) · [Backend connection and setup](submission/netlify.md). A deployed FastAPI backend and PostgreSQL are required for a working application.

**Public hosting:** [Deploy on Render](https://render.com/deploy?repo=https://github.com/diveshkumar2233/moneybeing-loan-assessment) · [Deployment instructions and free-tier limits](submission/deploy.md). This opens deployment setup; a live URL is issued only after deployment succeeds.

**[▶ Watch the 4-minute 33-second demo](https://github.com/diveshkumar2233/moneybeing-loan-assessment/blob/main/submission/walkthrough.webm)**

The recording explains the architecture, mock credit score integration, database-driven BRE, application workflow, duplicate validation, admin dashboard, lead management and rule changes using on-screen captions. **There is no spoken audio.**

If the preview does not play, **[download the video](https://github.com/diveshkumar2233/moneybeing-loan-assessment/raw/refs/heads/main/submission/walkthrough.webm)** and open it in a browser or a WebM-compatible video player. The [narration outline](submission/walkthrough-script.md) is also included.

## Architecture

```text
Next.js / TypeScript / Tailwind
           │ REST + JWT Bearer token
           ▼
FastAPI routers → Pydantic validation → mock credit service
           │                         → dynamic BRE
           ▼
SQLAlchemy 2 → PostgreSQL (users, leads, rules)
```

`backend/app/api` contains HTTP handlers; `schemas` validates requests and responses; `models` maps database tables; `services` implements credit scoring and rule evaluation; `core` holds configuration, sessions and password/JWT operations; `dependencies` enforces authentication and administrator roles. Passwords use Passlib with Argon2. Tokens expire after the configured interval and are stored in browser sessionStorage, removed on sign-out or a 401 response. Admin authorization is always enforced by the API.

The existing skeleton is preserved. Run the following commands from **this README's folder**, which contains `backend`, `frontend`, and `database`.

## Prerequisites

- Python 3.10+ (3.12 recommended for Docker), Node.js 20.9+ and npm.
- PostgreSQL 16+ or Docker Desktop with its engine running.
- Ports 8000 (API) and 3000 (web). The optional Windows database uses 55432; Docker publishes PostgreSQL on 5433.

## Backend and database setup

PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Set `SECRET_KEY` in `.env` to the generated value. Set your PostgreSQL connection URL and admin credentials. Do not overwrite an existing configured `.env`. Settings read `backend/.env` regardless of the working directory. On Linux/macOS use `source .venv/bin/activate` and `cp .env.example .env`.

Create the local database using an existing PostgreSQL administrator:

```sql
CREATE USER moneybeing WITH PASSWORD 'moneybeing';
CREATE DATABASE moneybeing OWNER moneybeing;
```

The default connection is `postgresql+psycopg://moneybeing:moneybeing@localhost:5432/moneybeing`. For the included Docker database alone, run `docker compose up -d db` from the project root and use port **5433** in the local backend `.env`.

Alternatively, on Windows with PostgreSQL 18 installed in its standard location, run from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File database/setup_local.ps1
```

This creates an isolated, password-authenticated, loopback-only development cluster under ignored `.local-postgres/`, plus `moneybeing` and `moneybeing_test` databases. Set `DATABASE_URL=postgresql+psycopg://moneybeing:moneybeing@127.0.0.1:55432/moneybeing`. Rerun the script to restart it after a reboot. To stop this cluster:

```powershell
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D .local-postgres stop
```

Initialize tables and seed the first admin and rules, then run the API (from `backend`, with the virtual environment active):

```powershell
python ../database/init_db.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Initialization is explicit, not performed on every API startup. It creates missing tables. It seeds rules **only when the rules table is first created**, so rerunning it never resurrects deleted rules or overrides edits. It creates the configured admin only when that email is absent; changing the environment password does not reset an existing user's password. Run initialization once before starting multiple API workers. This assessment uses a simple schema initializer; later schema changes should use migrations.

`database/default_rules.json` is first-install seed data. `database/schema.sql` is a PostgreSQL schema-only dump for inspection. Use the Python initializer as the normal installation path, which also hashes the admin password and seeds rules. Do not restore the schema dump before initialization if you expect first-install rule seeding.

## Frontend setup

In a second terminal:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**. `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000`. The API allows `http://localhost:3000` via `CORS_ORIGINS`; update both settings if changing hostnames or ports. Next.js embeds public environment settings at build time.

Sample development admin:

| Email | Password |
|---|---|
| `admin@moneybeing.local` | `MoneyBeing@123` |

Sign in at `/login`. Admin pages: `/dashboard`, `/leads`, `/rules`. Use different credentials and secrets for deployment. The sample password is for local assessment only.

## Credit scoring: explicitly MOCK

No real CIBIL/credit bureau endpoint or consumer financial data service is contacted. Authenticated bureau access generally requires a commercial integration and consent workflow; this assessment uses the allowed mock alternative. `services/credit_score.py` hashes the mobile and DOB into a stable pseudo-random score between 550 and 850. It is **not an actual creditworthiness estimate**. The same input produces the same score, keeping demonstrations repeatable.

Set `MOCK_CREDIT_FAILURE=true` and restart the backend to exercise failure handling. The application is still saved with a null score, `Not Eligible`, and an explicit manual-review reason. A fabricated fallback score is never used. Null scores are excluded from dashboard averages. This is a conservative failure policy rather than a lending rule. Set the flag back to false afterward.

## Dynamic business rules

All thresholds, operators, percentages, activation flags, and rejection messages are database rows. The Python engine contains only safe field access and comparison operations, with no eligibility thresholds and no `eval`. Every new application reads all committed active rules; changes immediately affect future submissions. Existing leads retain their original decision, reasons and full evaluated-rule snapshot.

First-install rules come exclusively from `database/default_rules.json`: age between 21 and 60 inclusive; monthly income at least ₹30,000; credit score at least 700; and requested loan at most 80% of property value.

Supported fields: `age`, `monthly_income`, `credit_score`, `loan_amount`, `property_value`. Supported operators: `>=`, `<=`, `==`, `!=`, `>`, `<`. Age uses completed years on the assessment date. Currency and rule values use Decimal, stored as `NUMERIC(16,2)`.

With `reference_field=null`, `value` is an absolute threshold. With a reference field, `value` is a percentage: `field operator (reference_field × value / 100)`. For example, the seeded property rule stores `field=loan_amount`, `operator=<=`, `value=80`, `reference_field=property_value`. The admin editor supports both forms. All active rules must pass. If there are no active rules, an application with an available score passes; the rule-management interface states this explicitly. Invalid configurations written directly to SQL fail safely with HTTP 503.

## Validation and errors

Frontend validation and Pydantic enforce required fields, 10-digit mobile numbers, email format, 6-digit Indian pincodes (nonzero first digit), plausible DOB from 1900 through yesterday, positive two-decimal monetary amounts, known loan/employment types, and explicit true consent. Minimum/maximum lending age is evaluated by database rules rather than input validation. Names and cities are trimmed and length checked.

- `201`: application created; `409`: `{"detail":"Lead already exists"}`. A unique database constraint also protects simultaneous duplicate submissions.
- `422`: invalid input, with field-level Pydantic details.
- `401`: missing/invalid/expired authentication; `403`: non-admin role.
- `404`: missing lead/rule; `503`: database failure or invalid rule configuration.

The public create endpoint returns **exactly four JSON keys** as requested. Rejection reasons and credit-service warnings are returned in CORS-exposed `X-Rejection-Reasons` (JSON array) and `X-Credit-Score-Error` headers. The form reads these immediately; admin-only lead detail returns the stored reasons. Private lead records cannot be fetched anonymously.

## API and Postman

Swagger: **http://localhost:8000/docs** · ReDoc: `/redoc` · OpenAPI: `/openapi.json`. Swagger's Authorize dialog accepts the admin email as `username`.

Import `postman/MoneyBeing.postman_collection.json`. Login automatically sets the collection's `token` variable. Set `base_url`, `admin_email`, `admin_password`, and a fresh `mobile` for each application. The create request captures `lead_id`; rule creation captures `rule_id`.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/leads` | Public |
| GET | `/api/leads?search=Asha&loan_type=Home%20Loan&bre_status=Eligible&page=1&page_size=10` | Admin |
| GET | `/api/leads/export` (same search/filter parameters) | Admin |
| GET | `/api/leads/{id}` | Admin |
| POST | `/api/auth/login` (form-encoded username/password) | Public |
| GET | `/api/auth/me` | Signed-in user |
| GET | `/api/dashboard/summary` | Admin |
| GET / POST | `/api/rules` | Admin |
| GET / PUT / DELETE | `/api/rules/{id}` | Admin |
| GET | `/health` | Public |

Example (bash; on Windows use `curl.exe` or Postman):

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'username=admin@moneybeing.local' \
  --data-urlencode 'password=MoneyBeing@123'

curl -X POST http://localhost:8000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"Asha Sharma","mobile":"9876543210","email":"asha@example.com","date_of_birth":"1995-05-12","city":"Bengaluru","pincode":"560001","loan_type":"Home Loan","employment_type":"Salaried","monthly_income":75000,"loan_amount":4000000,"property_value":6000000,"consent":true}'

curl http://localhost:8000/api/dashboard/summary -H 'Authorization: Bearer YOUR_TOKEN'
```

Response example (score and ID vary):

```json
{"status":"success","lead_id":101,"credit_score":742,"bre_status":"Eligible"}
```

## Tests and builds

```powershell
# From backend, with virtual environment active
pytest -q
# PostgreSQL integration run: use ONLY a dedicated disposable database.
# The test suite creates and DROPS its tables after each test.
$env:TEST_DATABASE_URL='postgresql+psycopg://moneybeing:moneybeing@127.0.0.1:55432/moneybeing_test'
pytest -q
Remove-Item Env:TEST_DATABASE_URL

# From frontend
npm run typecheck
npm run build
npm start
```

By default tests use isolated in-memory SQLite for speed; the application uses PostgreSQL. Tests cover dynamic updates, percentage boundaries, duplicate protection, validation, authorization, login, rule CRUD, dashboard statistics, export and credit-service failure. The PostgreSQL mode verifies the same workflow against the production database engine.

Browser checks live in `frontend/tests/workflow.spec.ts`. Point a separately started backend at a dedicated test database, initialize it with `database/init_db.py`, start the frontend on port 3000, and run `npm run test:e2e`. They create sample applications and exercise form submission, duplicate rejection, login, lead search/detail/export, rule creation/edit/deletion and mobile layout. The default browser is installed Microsoft Edge; on another platform, install Chromium with `npx playwright install chromium` and remove `channel: 'msedge'` from `playwright.config.ts`. Do not run these checks against a database containing real applications.

## Docker

Create `backend/.env` as above, then from the project root:

```powershell
docker compose up --build -d
docker compose logs -f backend
docker compose down
```

The backend waits for the database healthcheck and initializes it before serving. Persistent PostgreSQL data is stored in a named volume. The compose file uses local demo database credentials. Backend `.env` supplies the JWT secret and admin credentials; its database URL is overridden to the Docker service. Visit localhost:3000. Changing the web API URL requires rebuilding the frontend image. `docker compose down` preserves database data.

## Deployment and assessment handoff

The module includes administrator role enforcement; user signup and role provisioning are intentionally not public APIs. Before exposing this assessment to the internet, configure HTTPS, deployment secrets, backups, gateway rate limits for public submission/login, and an appropriate production session strategy. The bundled configuration is a local assessment setup.

Commit source and lockfiles, not `.env`, virtual environments, real customer exports or PostgreSQL cluster files. The submission folder contains a captioned walkthrough recording and a narration outline. `database/demo_dump.sql` contains schema and explicitly synthetic demonstration data for reviewer setup. See `submission/README.md` for restoration instructions and `submission/verification.md` for verification results. GitHub repository: https://github.com/diveshkumar2233/moneybeing-loan-assessment.

Implementation references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [FastAPI JWT authentication](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/).
