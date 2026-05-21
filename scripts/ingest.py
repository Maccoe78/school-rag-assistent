from app.services.ingest_service import ingest_documents

if __name__ == "__main__":
    
def ingest_documents() -> None:
    print("Loading documents...")
    documents = load_documents(DATA_DIR)
    print(f"Loaded {len(documents)} documents.")

    if documents:
        print("First document preview:")
        print(repr(documents[0].page_content[:500]))

    print("Splitting documents into chunks...")
    chunks = split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    print("Building Chroma vector store...")
    build_vectorstore(chunks)
    print("Ingestion complete.")