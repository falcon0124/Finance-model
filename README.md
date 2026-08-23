# AI Financial Research Assistant

A RAG-powered app for querying public company financial filings (10-Ks/10-Qs) and news in natural language, with cited, grounded answers, live stock data, and side-by-side company comparisons.

## Status

Phase 1 (pipeline proof-of-concept) complete: SEC EDGAR fetch → chunk → embed (local sentence-transformers) → Chroma vector store → retrieval → Groq generation with citations.

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
cp .env.example .env  # then fill in GROQ_API_KEY and SEC_EDGAR_USER_AGENT
```

## Scripts (Phase 1)

```bash
python scripts/fetch_filing.py   # fetch latest AAPL 10-K from SEC EDGAR
python scripts/ingest.py         # chunk, embed, and store in local Chroma
python scripts/query.py "your question here"
```

## Roadmap

- [x] Phase 0 — tech decisions, repo scaffold
- [x] Phase 1 — pipeline proof-of-concept
- [ ] Phase 2 — FastAPI backend, dynamic ingestion, company registry
- [ ] Phase 3 — stock data + comparison endpoint
- [ ] Phase 4 — frontend (Next.js + Tailwind)
- [ ] Phase 5 — hardening + deployment
