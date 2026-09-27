# Verification record

For the latest requirement-by-requirement review, PostgreSQL test run, production build and browser results, see [the 27 September assessment audit](assessment-checklist.md). The record below describes the earlier packaging pass.

Verified on 26 September 2026.

| Check | Result |
|---|---|
| Backend tests | 17 passed on this submission pass; also previously passed against PostgreSQL |
| Frontend TypeScript | `npm run typecheck` passed |
| Python lint | Ruff passed for app, tests and database scripts |
| Frontend production build | Passed during the implementation verification |
| Automated browser tests | 2 passed during the implementation verification |
| Recorded real browser workflow | Completed: submission, duplicate rejection, admin login/dashboard, pagination/search/detail/export, rule create/edit/delete and a new rule affecting a subsequent application |
| PostgreSQL full dump | Restored successfully into a new `moneybeing_restore_check` database with `ON_ERROR_STOP=1` |
| Restored demo data | 14 leads: 4 eligible, 10 not eligible; 5 current rules; 1 demo admin |
| Walkthrough video | WebM, 1440×1200, 4:33; captioned with no audio; sample frame visually checked |
| Docker backend image | Built successfully on the retry |
| Docker full stack | Not verified: frontend build blocked by Docker Engine reporting a read-only internal filesystem |

Docker's exact blocking error was: `mkdir /var/lib/docker/volumes/buildx_buildkit_default_state: read-only file system`. The initial parallel build also lost its Docker Engine connection. Docker Desktop was restarted and builds were retried sequentially; the backend then built successfully, while frontend builder initialization hit the host filesystem error. No Docker data reset or destructive host repair was attempted. This is an outstanding environment limitation, not a successful full-stack Docker test. Use the verified local setup, or fix Docker Desktop storage and rerun:

```powershell
docker compose -p moneybeing-verify -f docker-compose.yml -f submission/compose.verify.yml build frontend
docker compose -p moneybeing-verify -f docker-compose.yml -f submission/compose.verify.yml up -d
```

The verification override uses ports 3003/8003/55433 so it does not conflict with an existing local application. The default compose setup remains ports 3000/8000/5433.

The host C: drive subsequently reported zero free bytes. The generated recording build cache was NTFS-compressed without deleting its contents to recover enough space for packaging. Docker Desktop was stopped after verification attempts; full container verification remains pending until host storage is repaired.

The test run emitted two dependency deprecation warnings (Passlib/Argon2 version access and Starlette's httpx test-client integration); no tests failed.

No existing customer records were copied into the submission. All included database and Excel demo records are synthetic. Real environment configuration and PostgreSQL cluster files are excluded from Git and the source archive.

Repository destination: https://github.com/diveshkumar2233/moneybeing-loan-assessment. Source, demo dump, Postman collection and recording are included in Git; local secrets and real database files are excluded.
