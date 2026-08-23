# AI Financial Research Assistant

A RAG-powered app for querying public company financial filings (10-Ks/10-Qs) and news in natural language, with cited, grounded answers, live stock data, and side-by-side company comparisons.

## Status

Phase 2 (FastAPI backend with dynamic ingestion) complete. Any ticker can be queried — if it hasn't been indexed yet, the backend fetches its latest 10-K from SEC EDGAR, chunks/embeds/stores it, registers it, then answers.

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
cp .env.example .env  # then fill in GROQ_API_KEY and SEC_EDGAR_USER_AGENT
```

## Running the API

```bash
uvicorn app.main:app --reload
```

Interactive docs at `http://127.0.0.1:8000/docs`.

- `POST /query` — `{"ticker": "AAPL", "question": "..."}` → cited answer, auto-ingests if not yet indexed
- `POST /ingest` — `{"ticker": "AAPL"}` → force (re)ingestion
- `GET /companies` — list indexed companies

## Roadmap

- [x] Phase 0 — tech decisions, repo scaffold
- [x] Phase 1 — pipeline proof-of-concept
- [x] Phase 2 — FastAPI backend, dynamic ingestion, company registry
- [ ] Phase 3 — stock data + comparison endpoint
- [ ] Phase 4 — frontend (Next.js + Tailwind)
- [ ] Phase 5 — hardening + deployment
