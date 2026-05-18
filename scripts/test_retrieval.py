from app.services.retriever_service import search_documents


def run_query(query: str):
    results = search_documents(query, k=4)

    print(f"\nQuery: {query}\n")
    print("=" * 80)

    for i, doc in enumerate(results, start=1):
        print(f"\nResult {i}")
        print(f"Source: {doc.metadata.get('source')}")
        print(f"Category: {doc.metadata.get('category')}")
        print(f"Filename: {doc.metadata.get('filename')}")
        print("-" * 80)
        print(doc.page_content[:800])
        print("-" * 80)


def main():
    queries = [
        "How many times may I retake an exam?",
        "What is the resit policy for exams?",
        "How many resit opportunities do students have?",
    ]

    for query in queries:
        run_query(query)


if __name__ == "__main__":
    main()