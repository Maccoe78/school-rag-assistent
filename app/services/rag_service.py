import ollama

from app.core.config import OLLAMA_MODEL_NAME
from app.core.prompts import RAG_SYSTEM_PROMPT
from app.services.retriever_service import search_documents


def build_context(documents) -> str:
    context_parts = []

    for i, doc in enumerate(documents, start=1):
        source = doc.metadata.get("filename", "unknown")
        content = doc.page_content

        context_parts.append(
            f"[Document {i} | Source: {source}]\n{content}"
        )

    return "\n\n".join(context_parts)


def ask_rag(question: str, k: int = 4, model: str = OLLAMA_MODEL_NAME):
    documents = search_documents(question, k=k)
    context = build_context(documents)

    user_prompt = f"""
Context:
{context}

Question:
{question}
"""

    response = ollama.chat(
        model=model,
        messages=[
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    answer = response["message"]["content"]

    sources = []
    seen = set()

    for doc in documents:
        filename = doc.metadata.get("filename")
        if filename and filename not in seen:
            seen.add(filename)
            sources.append(filename)

    return {
        "question": question,
        "answer": answer,
        "sources": sources,
    }