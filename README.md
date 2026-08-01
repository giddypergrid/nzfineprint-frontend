# Fine Print — Web

React + Vite + TypeScript frontend for NZ Gazette Fine Print. Talks to the FastAPI backend in
`../app` — `POST /search` (keyword + semantic) and `POST /ask` (the research agent).

## Run (dev)

Two processes, from the repo root.

1. **Backend** (needs Docker Desktop running):
   ```
   docker compose up -d db
   app/.venv/Scripts/python -m uvicorn app.main:app --reload    # http://127.0.0.1:8000
   ```
2. **Frontend**:
   ```
   cd web
   npm install        # first time only
   npm run dev        # http://localhost:5173
   ```

Open http://localhost:5173. The Vite dev server proxies `/search` and `/ask` to the backend
(`vite.config.ts`), so there is no CORS step in dev.

## Build

```
npm run build       # typecheck + production bundle into dist/
npm run preview      # serve the built bundle
```

## Layout

- `src/api/` — `types.ts` (mirror the backend schemas) + `client.ts` (the only place that calls the API)
- `src/components/` — one file per UI piece: `Masthead`, `SearchDeck`, `YearChart`, `HomeView`,
  `ResultsView` / `Filters`, `DetailView`, `AskView`, `Colophon`
- `src/lib/` — display helpers (`format.ts`), filter options (`facets.ts`), shared UI types (`ui.ts`)
- `src/hooks/` — `useTypewriter` (the animated placeholder)
- `src/styles/` — `tokens.css` (palette + type) and `app.css` (component styles)

## Production

Set `VITE_API_BASE` to the API origin (see `.env.example`) and serve `dist/` behind the same
domain, or add the origin to the CORS list in `app/main.py`.
