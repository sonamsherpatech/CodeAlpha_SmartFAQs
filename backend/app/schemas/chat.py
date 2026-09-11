from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatQuery(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="The user's question")

class ChatResponse(BaseModel):
    answer: str
    confidence: float
    matched_question: Optional[str] = None
    category: Optional[str] = None
    suggestions: List[str] = []

class FAQItem(BaseModel):
    id: int
    category: str
    question: str
    patterns: List[str] = []
    answer: str