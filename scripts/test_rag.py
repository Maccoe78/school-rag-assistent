from app.services.rag_service import ask_rag


def main():
    question = "How many times may I retake an exam?"
    result = ask_rag(question, k=2)

    print("\nQUESTION:")
    print(result["question"])

    print("\nANSWER:")
    print(result["answer"])

    print("\nSOURCES:")
    for source in result["sources"]:
        print(f"- {source}")


if __name__ == "__main__":
    main()