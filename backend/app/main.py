from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app import db
from app.services import ingestion, retrieval, llm, edgar

app = FastAPI(title="AI Financial Research Assistant")

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


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    ticker = req.ticker.upper()
    ingested_now = False

    if not ingestion.is_ingested(ticker):
        try:
            ingestion.ingest_company(ticker)
            ingested_now = True
        except edgar.CompanyNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))

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
