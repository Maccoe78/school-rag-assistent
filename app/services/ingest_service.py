from pathlib import Path
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

from app.core.config import (
    DATA_DIR,
    CHROMA_DIR,
    EMBEDDING_MODEL_NAME,
    CHROMA_COLLECTION_NAME,
)


def load_txt_documents(data_dir: Path) -> List[Document]:
    documents = []

    for file_path in data_dir.rglob("*.txt"):
        text = file_path.read_text(encoding="utf-8")

        category = file_path.parent.name
        filename = file_path.name
        relative_path = str(file_path.relative_to(data_dir.parent.parent))

        doc = Document(
            page_content=text,
            metadata={
                "source": relative_path,
                "category": category,
                "filename": filename,
            },
        )
        documents.append(doc)

    return documents


def split_documents(documents: List[Document]) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
    )
    return splitter.split_documents(documents)


def build_vectorstore(chunks: List[Document]) -> Chroma:
    embedding_function = SentenceTransformerEmbeddings(
        model_name=EMBEDDING_MODEL_NAME
    )

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_function,
        persist_directory=str(CHROMA_DIR),
        collection_name=CHROMA_COLLECTION_NAME,
    )

    return vectorstore


def ingest_documents() -> None:
    print("Loading documents...")
    documents = load_txt_documents(DATA_DIR)
    print(f"Loaded {len(documents)} documents.")

    print("Splitting documents into chunks...")
    chunks = split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    print("Building Chroma vector store...")
    build_vectorstore(chunks)
    print("Ingestion complete.")