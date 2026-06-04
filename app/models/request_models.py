from pydantic import BaseModel
from typing import List, Dict, Optional


class QuestionRequest(BaseModel):
    question: str
    k: int = 2
    history: Optional[List[Dict[str, str]]] = []
