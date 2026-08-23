"""Chunk + embed + store a company's 10-K into its own Chroma collection."""
import os
import chromadb
from sentence_transformers import SentenceTransformer

from app.services import edgar
from app import db

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"

_embed_model: SentenceTransformer | None = None
_chroma_client = None


def get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    return _embed_model


def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    return _chroma_client


def collection_name_for(ticker: str) -> str:
    return f"{ticker.lower()}_10k"


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap
    return chunks


def ingest_company(ticker: str) -> dict:
    """Fetch, chunk, embed, and store a company's latest 10-K. Registers it so future
    queries skip re-fetching. Returns a small summary dict."""
    ticker = ticker.upper()

    cik, name = edgar.lookup_company(ticker)
    filing_url = edgar.get_latest_10k_url(cik)
    text = edgar.fetch_and_clean(filing_url)

    chunks = chunk_text(text)
    embed_model = get_embed_model()
    embeddings = embed_model.encode(chunks).tolist()

    client = get_chroma_client()
    collection_name = collection_name_for(ticker)

    existing = [c.name for c in client.list_collections()]
    if collection_name in existing:
        client.delete_collection(collection_name)
    collection = client.create_collection(collection_name)

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"company": ticker, "filing_type": "10-K", "chunk_index": i} for i in range(len(chunks))]
    collection.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)

    db.upsert_company(ticker, name, cik, collection_name)

    return {"ticker": ticker, "name": name, "cik": cik, "chunks_stored": len(chunks), "filing_url": filing_url}


def is_ingested(ticker: str) -> bool:
    return db.get_company(ticker) is not None
