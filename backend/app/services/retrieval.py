"""Retrieve the most relevant chunks for a question from a company's Chroma collection."""
from app.services.ingestion import get_embed_model, get_chroma_client, collection_name_for

TOP_K = 5


def retrieve(question: str, ticker: str, top_k: int = TOP_K) -> dict:
    embed_model = get_embed_model()
    client = get_chroma_client()
    collection = client.get_collection(collection_name_for(ticker))

    query_embedding = embed_model.encode([question]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=top_k)

    return {
        "documents": results["documents"][0],
        "metadatas": results["metadatas"][0],
        "ids": results["ids"][0],
    }
