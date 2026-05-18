from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="Nova Tech College RAG API",
    version="1.0.0"
)

app.include_router(router)