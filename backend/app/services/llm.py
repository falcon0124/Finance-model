"""Build the RAG prompt and call Groq to generate a cited answer."""
import os
from groq import Groq

GROQ_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a financial research assistant. Answer the user's question \
using ONLY the provided context chunks from the company's SEC filing. \
Cite which chunk(s) you used, e.g. [chunk_3]. \
If the answer is not present in the context, say so explicitly — do not guess or use outside knowledge. \
Never predict future prices or performance."""

_client: Groq | None = None


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client


def build_prompt(question: str, chunks: list[str], ids: list[str]) -> str:
    context = "\n\n".join(f"[{cid}]\n{chunk}" for cid, chunk in zip(ids, chunks))
    return f"Context:\n{context}\n\nQuestion: {question}"


def generate_answer(question: str, chunks: list[str], ids: list[str]) -> str:
    prompt = build_prompt(question, chunks, ids)
    client = get_client()
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content
