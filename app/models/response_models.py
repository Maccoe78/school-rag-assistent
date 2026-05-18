from pydantic import BaseModel
from typing import List


class AskResponse(BaseModel):
    question: str
    answer: str
    sources: List[str]


class HealthResponse(BaseModel):
    status: str