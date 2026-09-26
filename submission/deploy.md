# Public deployment on Render

[Deploy this repository on Render](https://render.com/deploy?repo=https://github.com/diveshkumar2233/moneybeing-loan-assessment)

This link opens deployment setup; it is **not an already-live application**.

1. Sign in to Render and connect the GitHub repository if prompted.
2. Create the Blueprint using the root `render.yaml`. It defines one Docker web service and one managed PostgreSQL database in the same region, both using the free instance plan.
3. Enter your admin email and a new private password of at least 12 characters. Do not use the publicly documented local demo password. Render generates the JWT secret automatically.
4. Review the resource plans shown by Render. Do not enable paid resources unless you intend to pay. Apply the Blueprint and wait for the web service to become Live.
5. Open the actual `https://...onrender.com` URL provided by Render. Verify the application, `/login/`, `/docs` and `/health` before sharing the URL with the reviewer.

The root Dockerfile builds the existing Next.js application as a static export. FastAPI serves those files after its API routes. Browser API requests use the same origin, avoiding a second hosting account, build-time API URL setup, or permissive CORS. The ordinary separate local frontend/backend setup remains available.

The database starts empty except for the five default rules and your newly configured admin. No local customer data, SQL demo dump, recording, or `.env` is copied into the deployed runtime. Standard Render PostgreSQL URLs are normalized to use the installed psycopg 3 driver. Existing admin passwords are not overwritten on restart.

## Free tier limits

This is a temporary assessment hosting option: Render's free PostgreSQL database expires after **30 days**, and free web services sleep after **15 minutes** without traffic. The first request after sleeping can take about a minute. A workspace can have only one active free PostgreSQL database; if yours is already used, do not delete it to deploy this project. Choose another database arrangement or approve a suitable paid plan separately. Check the current [Render free-tier documentation](https://render.com/docs/free) and [Blueprint specification](https://render.com/docs/blueprint-spec).

## Deployment status

Hosting configuration is prepared. A Render account connection and successful remote build/deployment are still required before a live URL can be claimed. The local machine's limited disk space prevents a fresh full Docker build here; the Render build provides the final hosted-image check.
