# Assignment-3 — Product Catalog (Phase 1 & 2)

Setup and run instructions (local development):

1. Install dependencies

```bash
npm install
```

2. Copy `.env.sample` to `.env` and edit `MONGODB_URI` if needed

```powershell
Copy-Item .env.sample .env
```

3. Seed the database with sample products

```bash
npm run seed
```

4. Start the app

```bash
npm start
```

Notes:
- The seeder expects a running MongoDB instance pointed to by `MONGODB_URI`.
- The server listens on `PORT` from `.env` or defaults to `3000`.
