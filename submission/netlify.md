# Netlify frontend deployment

[Deploy frontend on Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/diveshkumar2233/moneybeing-loan-assessment)

This opens account/deployment setup; it is not a live application link.

The root `netlify.toml` builds the Next.js frontend in `frontend/` and publishes its static `out/` directory. It does not deploy FastAPI or PostgreSQL.

1. Deploy the backend and PostgreSQL first using the existing [Render setup](deploy.md). Keep the backend URL provided after deployment becomes Live.
2. Sign in to Netlify, import this GitHub repository, and use the checked-in build settings.
3. Set `NEXT_PUBLIC_API_URL` to the backend's actual HTTPS origin, without `/api`. This URL is public configuration; never put a database password or secret token in it. The build deliberately fails when the URL is missing or points to localhost.
4. Deploy. Copy the actual `https://...netlify.app` URL issued by Netlify.
5. In the backend hosting environment, set `CORS_ORIGINS` to a JSON array containing that exact Netlify origin, with no trailing slash. For example, use `["https://your-assigned-site.netlify.app"]` with your actual hostname. Restart/redeploy the backend after changing this variable.
6. On the Netlify URL, verify form submission, admin login, lead listing and Excel export. Use the private admin credentials configured on the hosted backend, not the local sample password.

Changing `NEXT_PUBLIC_API_URL` requires rebuilding the frontend. If you add a custom domain, add its origin to the backend CORS list too. See [Netlify build configuration](https://docs.netlify.com/build/configure-builds/overview/) and [environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/).

The supplied Render configuration also serves a frontend, so you can keep that running while using Netlify as the client-facing UI. Both UIs use the same hosted API/database. No hosting resources have been created just by adding these files.
