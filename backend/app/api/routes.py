from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.chat import ChatQuery, ChatResponse, FAQItem
from app.core.matcher import FAQMatcher
import os

router = APIRouter()

# GLobal matcher instance dependency
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "faqs.json")
matcher = FAQMatcher(data_path=os.path.abspath(DATA_PATH))

@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "University FAQ Chatbot API"
    }

@router.get("/faqs", response_model=List[FAQItem], tags=["FAQs"])
def get_all_faqs():
    """
        Returns the full list of FAQs.
    """
    return matcher.faqs

@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(query: ChatQuery):
    """
        Answer user queries via NLP similarity matching.
    """
    try:
        response = matcher.match(query.message)
        return ChatResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))