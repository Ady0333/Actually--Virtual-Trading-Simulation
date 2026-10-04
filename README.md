# Actually — Virtual Trading Simulator

Live site: https://super-cocada-af9c9c.netlify.app/

## Frontend (repo root, deployed on Netlify)

```
npm ci
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
```

Environment variable (Netlify → Site configuration → Environment variables):

| Variable       | Example                                                    |
| -------------- | ---------------------------------------------------------- |
| `VITE_API_URL` | `https://actually-virtual-trading-simulation.onrender.com` |

## Backend (`backend/`, deployed on Render)

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Environment variables (Render → Service → Environment):

| Variable       | Purpose |
| -------------- | ------- |
| `DATABASE_URL` | Postgres connection string. **Required in production**: without it the backend falls back to a local SQLite file, which Render's free tier wipes on every restart/redeploy. |
| `SECRET_KEY`   | JWT signing key. Set to a long random string in production. |
| `DB_PATH`      | Optional SQLite file path, used only when `DATABASE_URL` is not set. |
