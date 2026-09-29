# MoneyBeing Loan Eligibility & Lead Management

A full-stack assessment project for **MoneyBeing Private Limited**, built with **FastAPI, Next.js, TypeScript and PostgreSQL**.

## Live demo

### [Open the Live Project](https://moneybeing-loan-assessment-6.onrender.com/)

**Live URL:** https://moneybeing-loan-assessment-6.onrender.com/

[Admin Login](https://moneybeing-loan-assessment-6.onrender.com/login/) · [API Documentation](https://moneybeing-loan-assessment-6.onrender.com/docs) · [GitHub Repository](https://github.com/diveshkumar2233/moneybeing-loan-assessment)

Use the admin credentials shared privately for the hosted application. The sample credentials below are for local testing.

## Project walkthrough

[Watch the 4:21-minute recording](submission/walkthrough.mp4) · [Download video](https://github.com/diveshkumar2233/moneybeing-loan-assessment/raw/refs/heads/main/submission/walkthrough.mp4)

The recording shows the application form, mock credit score result, admin dashboard, lead management and business rules.

## Features

| Module | Implementation |
|---|---|
| Loan application | Customer and loan details, mandatory consent, frontend and backend validation |
| Credit scoring | Mock score generation, display, database storage and failure handling |
| Business Rule Engine | Database-driven rules, eligibility result and specific rejection reasons |
| Admin panel | JWT login; total, eligible and rejected leads; average credit score |
| Lead management | All required columns, name/mobile search, loan/status filters, pagination and admin-only deletion |
| Rule management | Add, edit, delete or deactivate rules; changes apply to future applications |
| REST API | Application submission, lead retrieval, authentication, rules and dashboard endpoints |
| Duplicate prevention | Repeated mobile numbers return HTTP 409: `Lead already exists` |

Extras include **Excel export, dashboard charts, Swagger, Postman, Docker configuration and automated tests**.

## Review the application

1. Open the live project, complete the application form and provide consent.
2. Submit to see the credit score, eligibility status and any rejection reasons.
3. Submit again with the same mobile number to verify duplicate prevention.
4. Sign in as an admin to review dashboard totals and search/filter leads.
5. Open a lead to view its details, or select **Export Excel**.
6. Edit a business rule and submit a new application with a different mobile number to verify the updated criteria.

Admins can select **Delete** beside an application in Lead Management. A confirmation appears before permanent deletion. Deleted applications no longer contribute to dashboard totals or exports; their mobile numbers can be used for new applications.

### Credit score disclosure

**This project uses a local mock service, not a real CIBIL or credit bureau API**, as permitted by the assessment. Mobile number and date of birth generate a repeatable score between 550 and 850. This requires no external bureau credentials.

If the service fails, the application is saved with an unavailable score, `Not Eligible` status and a manual-review reason. To test this locally, set `MOCK_CREDIT_FAILURE=true`, restart the backend, then submit a new application. Restore it to `false` afterward.

### Database-driven eligibility rules

| Rule | Default criterion |
|---|---|
| Minimum age | Age >= 21 |
| Maximum age | Age <= 60 |
| Monthly income | Income >= INR 30,000 |
| Credit score | Score >= 700 |
| Loan amount | Amount <= 80% of property value |

The initial rules are seeded from `database/default_rules.json` into the PostgreSQL `rules` table. **Each application reads active rules from the database; eligibility thresholds are not hardcoded in Python.** All active rules must pass. Editing a rule changes future evaluations without restarting the application; existing lead decisions remain unchanged.

## Architecture

```text
Next.js form / admin UI
        |
        v
FastAPI -> Pydantic validation -> Mock credit service -> BRE
        |
        v
SQLAlchemy -> PostgreSQL: users, leads, rules
```

- `backend/app/api/`: REST endpoints and admin authorization.
- `backend/app/schemas/` and `models/`: validation and database structure.
- `backend/app/services/`: application processing, mock credit scoring, dynamic rule evaluation and Excel export.
- `frontend/app/`: customer form, login, dashboard, leads and rules screens.
- `frontend/components/`: reusable UI, including the application form and eligibility result.
- `frontend/lib/`: API requests, application submission and shared TypeScript types.
- `database/`: initialization, default rules and SQL dumps.
- `postman/` and `submission/`: API collection, walkthrough and supporting files.

To follow a submission in the code, start with `frontend/app/page.tsx`. It passes the form to `frontend/lib/applications.ts`, which calls `POST /api/leads`. The endpoint delegates to `backend/app/services/lead_service.py` to check duplicates, fetch the score, evaluate database rules and save the lead. The endpoint then returns the assessment response.

## Run locally

**Requirements:** Python 3.10+, Node.js 20.9+, npm and PostgreSQL 16+.

Clone the repository and open its root folder:

```powershell
git clone https://github.com/diveshkumar2233/moneybeing-loan-assessment.git
cd moneybeing-loan-assessment
```

### 1. Create the database

Run the following SQL using a PostgreSQL administrator in pgAdmin or psql:

```sql
CREATE USER moneybeing WITH PASSWORD 'moneybeing';
CREATE DATABASE moneybeing OWNER moneybeing;
```

The instructions below use PostgreSQL on port **5432**. If your server uses another port, update `DATABASE_URL`.

**Windows alternative:** With PostgreSQL 18 installed in its standard location, run `powershell -ExecutionPolicy Bypass -File database/setup_local.ps1` from the project root. This creates an isolated database on port **55432**. For that setup, use `127.0.0.1:55432` in `DATABASE_URL`.

### 2. Configure and start the backend

In the first terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Open `backend/.env`:

- Set `SECRET_KEY` to the random output from the last command.
- Set `DATABASE_URL` to `postgresql+psycopg://moneybeing:moneybeing@localhost:5432/moneybeing`, adjusting credentials/port if needed.
- Keep `CORS_ORIGINS=["http://localhost:3000"]` for local use.
- Keep the sample admin credentials for local testing or choose your own.

Then initialize the database and start the API:

```powershell
python ../database/init_db.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The initializer creates tables, the admin account and first-install rules. Rerunning it preserves rule edits and existing admin passwords.

**Reset an existing admin password on Render:** set `ADMIN_EMAIL` to the existing admin email, set `ADMIN_PASSWORD` to your chosen private password (at least 12 characters), and temporarily set `RESET_ADMIN_PASSWORD_ON_START=true`. Deploy the latest Docker image; its initializer updates that active admin's password hash without changing leads or rules. Sign in using the configured password, then set `RESET_ADMIN_PASSWORD_ON_START=false`. Leaving it enabled reapplies the configured password on every startup. This does not reactivate disabled accounts or promote non-admin users.

On Linux/macOS, use `source .venv/bin/activate` and `cp .env.example .env` instead of the PowerShell equivalents.

### 3. Start the frontend

Open a second terminal at the project root:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

On Linux/macOS, use `cp .env.local.example .env.local`. The frontend environment variable `NEXT_PUBLIC_API_URL` should point to `http://localhost:8000`.

Open **http://localhost:3000**. Local API documentation is at **http://localhost:8000/docs**.

Use `npm run dev` for local development; its cache is `.next-dev`. Production builds use `.next`, and static exports publish to `out`, which the Render Dockerfile copies into the application image. If using `npm start`, stop that server before rebuilding its production output, then restart it. A running server with overwritten assets can leave admin pages stuck on "Checking your session"; restart the frontend and hard-refresh the browser in that case.

| Local admin email | Local admin password | Render Link admin Password |
|---|---|---|
| `admin@moneybeing.local` | `MoneyBeing@123` | `jXGWff5pi2AuAOx2E9wkSKrxoHZrViL-`

These are development credentials. Do not reuse them for a public deployment or commit your `.env` files.

The local credentials above are for local testing only and should not be reused on Render. In the Render service Environment settings, set `ADMIN_EMAIL` to the hosted admin login and `ADMIN_PASSWORD` to a new, unique password of at least 12 characters. Do not publish the hosted password in this repository.

## API examples

### Create an application

Send `POST /api/leads` with `Content-Type: application/json`:

```json
{
  "full_name": "Asha Sharma",
  "mobile": "9876543210",
  "email": "asha@example.com",
  "date_of_birth": "1995-05-12",
  "city": "Bengaluru",
  "pincode": "560001",
  "loan_type": "Home Loan",
  "employment_type": "Salaried",
  "monthly_income": 75000,
  "loan_amount": 4000000,
  "property_value": 6000000,
  "consent": true
}
```

Example response; ID, score and result depend on the application:

```json
{
  "status": "success",
  "lead_id": 101,
  "credit_score": 742,
  "bre_status": "Eligible"
}
```

Rejection reasons appear in the UI and admin lead details. The create endpoint also returns them in the `X-Rejection-Reasons` response header while preserving the four-field JSON response.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Form-encoded `username` (email) and `password`; returns JWT |
| POST | `/api/leads` | Submit application |
| GET | `/api/leads` | Search, filter and paginate leads |
| GET | `/api/leads/{id}` | Lead details |
| DELETE | `/api/leads/{id}` | Permanently delete an application (admin only) |
| GET | `/api/leads/export` | Excel export |
| GET | `/api/dashboard/summary` | Dashboard metrics |
| GET / POST | `/api/rules` | List or create rules |
| GET / PUT / DELETE | `/api/rules/{id}` | Read, edit or delete a rule |

Management endpoints require an admin JWT in `Authorization: Bearer <token>`.

**Postman:** Import [the collection](postman/MoneyBeing.postman_collection.json), set `base_url` to the local or live URL, and enter the appropriate admin credentials. Run **Admin login** first; the collection captures the token automatically. Use a new mobile number for each application.

## Tests

From `backend/` with the virtual environment active:

```powershell
pytest -q
```

From `frontend/`:

```powershell
npm run typecheck
npm run build
```

The latest local check passed **21 backend tests** and TypeScript validation. Backend tests use an isolated in-memory database by default. GitHub Actions also verifies backend tests and the hosted frontend build.

Browser tests are in `frontend/tests/`. They require the API and frontend running against a **dedicated test database**, plus Microsoft Edge, before running `npm run test:e2e`; they create demo leads and change rules.

## Submission files

| Deliverable | Link |
|---|---|
| GitHub repository | [Source code](https://github.com/diveshkumar2233/moneybeing-loan-assessment) |
| SQL database dump | [Schema + synthetic demo data](database/demo_dump.sql) |
| Database restore instructions | [Restore guide](submission/README.md#restore-the-demo-database) |
| Setup instructions | This README |
| Postman collection | [Import JSON](postman/MoneyBeing.postman_collection.json) |
| Screen recording | [4:21-minute walkthrough](submission/walkthrough.mp4) |

The SQL dump contains synthetic demonstration records, not real customer data. Restore it into a new database as an alternative to fresh initialization.

The hosted application uses the root `Dockerfile`. Optional local Docker setup is available through `docker compose up --build -d` after configuring `backend/.env`; it serves the UI on port 3000 and API on 8000.
