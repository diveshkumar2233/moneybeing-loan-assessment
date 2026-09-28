# Assessment submission

The SQL dump contains synthetic demonstration data. The walkthrough is the author-supplied local screen recording with enhanced original audio.

## Contents

- `database/demo_dump.sql`: PostgreSQL schema and synthetic data, including demo admin and all five default rules.
- `postman/MoneyBeing.postman_collection.json`: API requests.
- `submission/walkthrough.mp4`: 4-minute 23-second author-supplied screen recording with original narration and a modest volume increase. H.264/AAC MP4, approximately 8.7 MB; download or open it in a compatible browser/player. The original source recording is unchanged.
- `submission/walkthrough-script.md`: explanation outline for a personally narrated presentation.
- Root `README.md`: full setup and architecture documentation.
- `submission/assessment-checklist.md`: requirement-by-requirement audit and current verification limits.

## Restore the demo database

Use a new database to avoid replacing existing data. PostgreSQL 18 is recommended for this dump.

```powershell
createdb -h localhost -p 5432 -U postgres moneybeing_review
psql -h localhost -p 5432 -U postgres -d moneybeing_review -v ON_ERROR_STOP=1 -f database/demo_dump.sql
```

Set the backend `DATABASE_URL` to your restored database and credentials, configure a new JWT secret, and start the backend and frontend using the root README. The restored demo admin is `admin@moneybeing.local` / `MoneyBeing@123`. Database credentials are configured locally and are not part of the dump. Do not use the demo admin password for deployment.

The JSON seed file is used only on first installation. The dump already contains rules; after restoration, rules are loaded from the database at evaluation time.

The dump contains 14 synthetic leads (4 eligible and 10 not eligible), five current rules, and one demo admin. One historical lead demonstrates a temporary rule that was subsequently deleted; its stored rejection reason remains intact by design.

To generate the earlier automated captioned demo (not the current narrated recording), initialize and seed `moneybeing_submission` using `database/init_db.py` and `database/seed_demo.py` with `DATABASE_URL` pointing to that dedicated database. Start the API on port 8002 with `CORS_ORIGINS=["http://localhost:3002"]`. Start Next.js on port 3002 with `NEXT_PUBLIC_API_URL=http://localhost:8002` and `NEXT_DIST_DIR=.next-demo`. Then, from `frontend`, run `npx playwright install ffmpeg` followed by `node scripts/record-walkthrough.mjs`. Microsoft Edge must be installed. This writes synthetic applications into the dedicated database and captures on-screen explanations.

## Credit score disclosure

The credit service is a deterministic local mock, not a real CIBIL API. This is the mock alternative permitted by the assessment. Credit-provider failure handling is covered by automated tests.

## Audio enhancement verification

The current version restores the original recorded speech after the stronger noise suppression affected quiet syllables. It uses only a 60 Hz high-pass to reduce low rumble and a fixed 6 dB gain. There is no neural denoising, noise gate, speech removal or dynamic volume processing. Some cooler noise remains so that quiet speech is not suppressed.

Full-file decoding passed. Measured integrated loudness is -20.99 LUFS and true peak is -1.79 dBTP. Video packets were copied unchanged; duration remains approximately 262.8 seconds, resolution 1916?946 and frame rate 20 fps. Audio is stereo AAC at 48 kHz, 192 kb/s. The original source and previous processed versions remain backed up outside the repository. These checks establish file integrity and levels, not a guarantee of perfect intelligibility; listen to this version before client delivery.
