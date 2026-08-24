import os

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import db
from app.services import ingestion, retrieval, llm, edgar, stocks

app = FastAPI(title="AI Financial Research Assistant")

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

db.init_db()


class QueryRequest(BaseModel):
    ticker: str
    question: str


class QueryResponse(BaseModel):
    ticker: str
    answer: str
    sources: list[dict]
    ingested_now: bool


class IngestRequest(BaseModel):
    ticker: str


class CompareRequest(BaseModel):
    ticker_a: str
    ticker_b: str


def _ensure_ingested(ticker: str) -> bool:
    """Returns True if ingestion happened just now (wasn't already indexed)."""
    if ingestion.is_ingested(ticker):
        return False
    try:
        ingestion.ingest_company(ticker)
        return True
    except edgar.CompanyNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    ticker = req.ticker.upper()
    ingested_now = _ensure_ingested(ticker)

    results = retrieval.retrieve(req.question, ticker)
    if not results["documents"]:
        raise HTTPException(status_code=404, detail=f"No indexed content for {ticker}")

    answer = llm.generate_answer(req.question, results["documents"], results["ids"])

    sources = [
        {"id": cid, "text": doc}
        for cid, doc in zip(results["ids"], results["documents"])
    ]

    return QueryResponse(ticker=ticker, answer=answer, sources=sources, ingested_now=ingested_now)


@app.post("/ingest")
def ingest(req: IngestRequest):
    try:
        summary = ingestion.ingest_company(req.ticker)
    except edgar.CompanyNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return summary


@app.get("/companies")
def companies():
    return [
        {
            "ticker": c.ticker,
            "name": c.name,
            "cik": c.cik,
            "last_ingested_at": c.last_ingested_at.isoformat(),
        }
        for c in db.list_companies()
    ]


@app.get("/stock/{ticker}")
def stock(ticker: str):
    try:
        return stocks.get_stock_data(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/compare")
def compare(req: CompareRequest):
    ticker_a = req.ticker_a.upper()
    ticker_b = req.ticker_b.upper()

    _ensure_ingested(ticker_a)
    _ensure_ingested(ticker_b)

    try:
        stock_a = stocks.get_stock_data(ticker_a)
        stock_b = stocks.get_stock_data(ticker_b)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Pull a broad set of representative chunks for each company (financial-summary-ish query)
    summary_query = "total revenue, net income, and key financial results"
    results_a = retrieval.retrieve(summary_query, ticker_a, top_k=2)
    results_b = retrieval.retrieve(summary_query, ticker_b, top_k=2)

    summary = llm.generate_comparison(
        ticker_a, results_a["documents"], stock_a,
        ticker_b, results_b["documents"], stock_b,
    )

    return {
        "ticker_a": {"ticker": ticker_a, "stock": stock_a, "sources": results_a["ids"]},
        "ticker_b": {"ticker": ticker_b, "stock": stock_b, "sources": results_b["ids"]},
        "summary": summary,
    }
