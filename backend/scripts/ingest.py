"""Phase 1: chunk the saved filing, embed it, and store it in a local Chroma collection."""
import os
import chromadb
from sentence_transformers import SentenceTransformer

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "aapl_10k.txt")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

CHUNK_SIZE = 500   # approx words per chunk
CHUNK_OVERLAP = 50  # approx words of overlap

EMBED_MODEL = "all-MiniLM-L6-v2"
COLLECTION_NAME = "aapl_10k"


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
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


if __name__ == "__main__":
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    print("Chunking...")
    chunks = chunk_text(text, CHUNK_SIZE, CHUNK_OVERLAP)
    print(f"Created {len(chunks)} chunks")

    print(f"Loading embedding model {EMBED_MODEL}...")
    model = SentenceTransformer(EMBED_MODEL)

    print("Embedding chunks...")
    embeddings = model.encode(chunks, show_progress_bar=True).tolist()

    print("Storing in Chroma...")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    client.delete_collection(COLLECTION_NAME) if COLLECTION_NAME in [c.name for c in client.list_collections()] else None
    collection = client.create_collection(COLLECTION_NAME)

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"company": "AAPL", "filing_type": "10-K", "chunk_index": i} for i in range(len(chunks))]

    collection.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)

    print(f"Stored {len(chunks)} chunks in collection '{COLLECTION_NAME}' at {CHROMA_PATH}")
