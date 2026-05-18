from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

from app.core.config import (
    CHROMA_DIR,
    EMBEDDING_MODEL_NAME,
    CHROMA_COLLECTION_NAME,
)


def normalize_query(query: str) -> str:
    normalized = query.lower()

    replacements = {
        "retake": "resit",
        "retakes": "resits",
        "retaking": "resit",
        "retaken": "resit",
        "redo exam": "resit exam",
        "redo test": "resit test",
    }

    for old, new in replacements.items():
        normalized = normalized.replace(old, new)

    return normalized


def get_vectorstore() -> Chroma:
    embedding_function = SentenceTransformerEmbeddings(
        model_name=EMBEDDING_MODEL_NAME
    )

    vectorstore = Chroma(
        persist_directory=str(CHROMA_DIR),
        embedding_function=embedding_function,
        collection_name=CHROMA_COLLECTION_NAME,
    )

    return vectorstore


def search_documents(query: str, k: int = 4):
    vectorstore = get_vectorstore()
    normalized_query = normalize_query(query)
    results = vectorstore.max_marginal_relevance_search(
        normalized_query,
        k=k,
        fetch_k=10,
    )
    return results