# Deployment

## Local development

1. From the repository root, install the workspace dependencies with `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and set the local `MONGO_URI`, a strong `JWT_SECRET`, and any email settings you use. The local example defaults to `http://localhost:5173` for `FRONTEND_URL`.
3. Copy `frontend/.env.example` to `frontend/.env.local`. Its `VITE_API_URL=http://localhost:5000` points the browser at the local Express server.
4. In one terminal run `npm run dev:backend`; in another run `npm run dev:frontend`.
5. Verify with `npm test --workspace backend` and `npm run build --workspace frontend`.

## Create the first administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters in the ignored `backend/.env` file, then run `npm run seed:admin` from the repository root. The script hashes the password and refuses to overwrite an existing account. The API and frontend do not provide public administrator registration. Remove the three seed variables after setup; never commit them or put them in `VITE_*` variables.

Run the seed only when `MONGO_URI` points to the intended database. It writes an administrator record to that database.

## Deploy one Vercel project

1. Rotate the exposed Atlas database password, JWT signing secret, and Gmail app password before connecting production. Update the ignored local `.env` values as needed; do not reuse the old credentials.
2. Push the repository to GitHub and import that repository into Vercel as one project.
3. Set the Vercel project Root Directory to the repository root (`.`), not `frontend` or `backend`.
4. Keep the framework override as Other/None. `vercel.json` supplies the frontend build command, `frontend/dist` output, the `/api/*` Express function, and the React SPA fallback.
5. Add the required server-only environment variables below for Production (and Preview if previews need real data). Do not define `VITE_API_URL` in production; the client then calls same-origin `/api/...` URLs.
6. Deploy, then check `/api/health`, `/api/products`, `/admin/login`, and refresh a nested React route. The health route does not prove Atlas is connected; catalog and authenticated workflows require a valid `MONGO_URI`.

## Vercel environment variables

Required:

- `MONGO_URI`: MongoDB Atlas connection URI. Server-only.
- `JWT_SECRET`: long, random signing key. Server-only.
- `FRONTEND_URL`: the complete production Vercel origin, such as `https://your-project.vercel.app`; used for cookies, CORS, password-reset links, and newsletter links.

Required only when email features are enabled:

- `GMAIL_USER`: Gmail sender account.
- `GMAIL_APP_PASSWORD`: Gmail app password, not the normal account password.
- `EMAIL_FROM_NAME`: optional sender display name.

Vercel sets `NODE_ENV=production` for production deployments. Do not create `VITE_MONGO_URI`, `VITE_JWT_SECRET`, `VITE_GMAIL_*`, or other client-prefixed copies of backend secrets. `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are one-time seed inputs and do not belong in the running frontend or ordinary Vercel runtime configuration.

## MongoDB Atlas

Create a database user with only the permissions the application needs, use its URI as `MONGO_URI`, and allow the Vercel function's outbound network access in Atlas Network Access. Vercel egress addresses may not be fixed on every plan; if a broad IP allow-list is unavoidable, use a strong unique database password and least-privilege database user, and review whether a fixed-egress/private-network option is available for the account.

## Cloudinary and Gmail

Product images are uploaded directly from the browser to Cloudinary using the configured cloud name and unsigned upload preset. These values are public configuration, not API secrets. Restrict the preset to image formats and size limits appropriate for product photos. If signed uploads are required, implement server-generated signatures with a backend-only Cloudinary API secret; do not put that secret in Vite configuration.

Gmail SMTP runs from the backend using `GMAIL_USER` and `GMAIL_APP_PASSWORD`. Email sends are awaited so Vercel does not discard a background task after returning the response. A very large newsletter can exceed the configured function duration; use a durable queue/worker if subscriber volume makes synchronous delivery too long.
