# Railway deployment

## One-time setup

1. Create a new Railway project from this repo.
2. **Add a Volume** to the service (Settings → Volumes) and mount it at `/data`.
   The SQLite database lives in this volume — without it, all accounts are wiped on every deploy.
3. **Set environment variables** (Settings → Variables):
   - `JWT_SECRET` — a long random string. Generate one with `openssl rand -hex 32`.
   - `DATABASE_PATH` — `/data/truthscroll.db`
   - `NODE_ENV` — `production`
4. Deploy. Railway will run `npm run build` then `npm start` (see `railway.json`).

The server listens on `process.env.PORT` (Railway sets this automatically) and serves the built React app from `dist/`. The API lives under `/api/*` on the same origin, so no CORS config is needed in production.

## Local development

```
npm install
npm run dev   # runs API on :3001 and Vite on :5173 in parallel
```

Vite proxies `/api/*` to `http://localhost:3001`. The SQLite database is created at `./data/truthscroll.db` (gitignored).
