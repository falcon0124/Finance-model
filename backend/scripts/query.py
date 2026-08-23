"""Phase 1: ask a question, retrieve top-k chunks, generate a cited answer via Groq."""
import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
EMBED_MODEL = "all-MiniLM-L6-v2"
COLLECTION_NAME = "aapl_10k"
TOP_K = 5
GROQ_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a financial research assistant. Answer the user's question \
using ONLY the provided context chunks from the company's SEC filing. \
Cite which chunk(s) you used, e.g. [chunk_3]. \
If the answer is not present in the context, say so explicitly — do not guess or use outside knowledge. \
Never predict future prices or performance."""


def retrieve(question: str, embed_model: SentenceTransformer, collection):
    query_embedding = embed_model.encode([question]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=TOP_K)
    return results["documents"][0], results["metadatas"][0], results["ids"][0]


def build_prompt(question: str, chunks: list[str], ids: list[str]) -> str:
    context = "\n\n".join(f"[{cid}]\n{chunk}" for cid, chunk in zip(ids, chunks))
    return f"Context:\n{context}\n\nQuestion: {question}"


if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) or "What was Apple's total net sales in the most recent fiscal year?"
    print(f"Question: {question}\n")

    embed_model = SentenceTransformer(EMBED_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_collection(COLLECTION_NAME)

    chunks, metadatas, ids = retrieve(question, embed_model, collection)
    print(f"Retrieved chunks: {ids}\n")

    user_prompt = build_prompt(question, chunks, ids)

    groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    print("Answer:")
    print(response.choices[0].message.content)

    print("\n--- Source chunks used (for source-highlighting UI) ---")
    for cid, chunk in zip(ids, chunks):
        print(f"\n[{cid}]\n{chunk[:300]}...")
