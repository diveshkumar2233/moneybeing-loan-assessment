# Assessment submission

This package uses **synthetic demonstration data only**. No existing customer records or local environment secrets are included.

## Contents

- `database/demo_dump.sql`: PostgreSQL schema and synthetic data, including demo admin and all five default rules.
- `postman/MoneyBeing.postman_collection.json`: API requests.
- `submission/walkthrough.webm`: 4-minute 33-second captioned browser recording demonstrating the real application against a separate demo database. This recording has on-screen explanations and no spoken audio. Open it in a browser or a WebM-compatible video player.
- `submission/walkthrough-script.md`: explanation outline for a personally narrated presentation.
- Root `README.md`: full setup and architecture documentation.

## Restore the demo database

Use a new database to avoid replacing existing data. PostgreSQL 18 is recommended for this dump.

```powershell
createdb -h localhost -p 5432 -U postgres moneybeing_review
psql -h localhost -p 5432 -U postgres -d moneybeing_review -v ON_ERROR_STOP=1 -f database/demo_dump.sql
```

Set the backend `DATABASE_URL` to your restored database and credentials, configure a new JWT secret, and start the backend and frontend using the root README. The restored demo admin is `admin@moneybeing.local` / `MoneyBeing@123`. Database credentials are configured locally and are not part of the dump. Do not use the demo admin password for deployment.

The JSON seed file is used only on first installation. The dump already contains rules; after restoration, rules are loaded from the database at evaluation time.

The dump contains 14 synthetic leads (4 eligible and 10 not eligible), five current rules, and one demo admin. One historical lead demonstrates a temporary rule that was subsequently deleted; its stored rejection reason remains intact by design.

To reproduce the recording locally, initialize and seed `moneybeing_submission` using `database/init_db.py` and `database/seed_demo.py` with `DATABASE_URL` pointing to that dedicated database. Start the API on port 8002 with `CORS_ORIGINS=["http://localhost:3002"]`. Start Next.js on port 3002 with `NEXT_PUBLIC_API_URL=http://localhost:8002` and `NEXT_DIST_DIR=.next-demo`. Then, from `frontend`, run `npx playwright install ffmpeg` followed by `node scripts/record-walkthrough.mjs`. Microsoft Edge must be installed. This writes synthetic applications into the dedicated database and captures on-screen explanations.

## Credit score disclosure

The credit service is a deterministic local mock, not a real CIBIL API. This is the mock alternative permitted by the assessment. Credit-provider failure handling is covered by automated tests.
