"""Build the RAG prompt and call Groq to generate a cited answer."""
import os
from groq import Groq

GROQ_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a financial research assistant. Answer the user's question \
using ONLY the provided context chunks from the company's SEC filings (annual 10-K and, \
if present, the most recent quarterly 10-Q). \
Cite which chunk(s) you used, e.g. [10k_chunk_3] or [10q_chunk_5]. \
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


COMPARE_SYSTEM_PROMPT = """You are a financial research assistant. You are given filing \
excerpts and current stock data for two companies. Write a concise comparative summary \
(3-5 sentences) covering how they differ on the metrics present in the context. \
Use ONLY the provided context — do not use outside knowledge, and never predict future \
prices or performance."""


def generate_comparison(
    ticker_a: str, chunks_a: list[str], stock_a: dict,
    ticker_b: str, chunks_b: list[str], stock_b: dict,
) -> str:
    context_a = "\n\n".join(chunks_a)
    context_b = "\n\n".join(chunks_b)
    prompt = (
        f"{ticker_a} filing excerpts:\n{context_a}\n\n"
        f"{ticker_a} stock data: price ${stock_a['price']}, day change {stock_a['day_change_pct']}%\n\n"
        f"{ticker_b} filing excerpts:\n{context_b}\n\n"
        f"{ticker_b} stock data: price ${stock_b['price']}, day change {stock_b['day_change_pct']}%\n\n"
        f"Compare {ticker_a} and {ticker_b}."
    )

    client = get_client()
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": COMPARE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content
