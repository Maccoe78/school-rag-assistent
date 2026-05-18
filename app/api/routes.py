from fastapi import APIRouter

from app.models.request_models import QuestionRequest
from app.models.response_models import AskResponse, HealthResponse
from app.services.rag_service import ask_rag
from app.services.ingest_service import ingest_documents

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}


@router.post("/ask", response_model=AskResponse)
def ask_question(payload: QuestionRequest):
    result = ask_rag(payload.question, k=payload.k)
    return result


@router.post("/ingest")
def run_ingest():
    ingest_documents()
    return {"status": "ingestion complete"}